import { existsSync, readdirSync, mkdirSync, copyFileSync, statSync, rmSync } from "node:fs";
import { resolve, join, extname } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FOTOS_DIR = resolve(process.cwd(), "fotos");
const PUBLIC_DIR = resolve(process.cwd(), "public", "products");
const VALID_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const STOP = new Set([
  "de", "y", "con", "para", "el", "la", "los", "las", "un", "una",
  "set", "piezas", "pieza", "item", "del", "al",
  "s", "m", "l", "xl", "xs",
  "1", "2", "3", "4", "5", "6", "7", "8", "9",
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(
    normalize(s)
      .split(" ")
      .filter((t) => t.length > 1 && !STOP.has(t))
  );
}

const KNOWN_COLORS = [
  "burdeos", "negro", "blanco", "rojo", "rosa", "rosado", "verde",
  "azul", "marron", "marrón", "purpura", "púrpura", "malva",
  "beige", "nude", "gris", "amarillo", "naranja", "vino",
  "oxido", "óxido", "multicolor", "azul y blanco",
];

function detectColor(folder: string): string | null {
  const norm = folder
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const found: string[] = [];
  for (const c of KNOWN_COLORS) {
    const cn = c.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (new RegExp(`\\b${cn.replace(/\s+/g, "\\s+")}\\b`).test(norm)) {
      found.push(c);
    }
  }
  if (found.length === 0) return null;
  return found[0];
}

function score(folder: string, productKey: string): number {
  const a = tokens(folder);
  const b = tokens(productKey);
  if (a.size === 0 || b.size === 0) return 0;
  let common = 0;
  for (const t of a) if (b.has(t)) common++;
  const union = a.size + b.size - common;
  return common / union;
}

async function main() {
  if (!existsSync(FOTOS_DIR)) {
    console.error(`[sync-photos] no existe ${FOTOS_DIR}`);
    return;
  }

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, category: true },
  });

  const folders = readdirSync(FOTOS_DIR).filter((f) => {
    const p = join(FOTOS_DIR, f);
    return statSync(p).isDirectory();
  });

  console.log(`[sync-photos] ${folders.length} carpetas, ${products.length} productos`);

  const productFolders = new Map<string, Array<{ folder: string; score: number }>>();
  const unmatched: string[] = [];

  for (const folder of folders) {
    const scored = products
      .map((p) => ({ p, s: score(folder, p.name) }))
      .filter((x) => x.s >= 0.25)
      .sort((a, b) => b.s - a.s);

    if (scored.length === 0) {
      unmatched.push(folder);
      continue;
    }

    const top = scored[0].s;
    const winners = scored.filter((x) => x.s >= top * 0.95);

    for (const { p, s } of winners) {
      const arr = productFolders.get(p.id) ?? [];
      arr.push({ folder, score: s });
      productFolders.set(p.id, arr);
    }
  }

  if (existsSync(PUBLIC_DIR)) rmSync(PUBLIC_DIR, { recursive: true, force: true });
  mkdirSync(PUBLIC_DIR, { recursive: true });

  await prisma.image.deleteMany();

  let totalImages = 0;

  for (const product of products) {
    const matches = productFolders.get(product.id);
    if (!matches || matches.length === 0) continue;

    matches.sort((a, b) => b.score - a.score);
    const dstDir = join(PUBLIC_DIR, product.slug);
    mkdirSync(dstDir, { recursive: true });

    let order = 0;
    for (const { folder } of matches) {
      const srcDir = join(FOTOS_DIR, folder);
      const folderColor = detectColor(folder);
      const files = readdirSync(srcDir)
        .filter((f) => VALID_EXT.has(extname(f).toLowerCase()))
        .sort();

      for (const f of files) {
        const ext = extname(f).toLowerCase();
        const dstName = `${order + 1}${ext}`;
        copyFileSync(join(srcDir, f), join(dstDir, dstName));
        await prisma.image.create({
          data: {
            url: `/products/${product.slug}/${dstName}`,
            alt: product.name,
            order,
            color: folderColor,
            productId: product.id,
          },
        });
        order++;
      }
    }

    totalImages += order;
    const folderList = matches.map((m) => `"${m.folder.slice(0, 30)}"`).join(", ");
    console.log(
      `[sync-photos] ${product.slug.slice(0, 50)} ← ${matches.length} carpeta(s) [${folderList}] (${order} imgs)`
    );
  }

  const unmatchedProducts = products.filter((p) => !productFolders.has(p.id));
  if (unmatchedProducts.length > 0) {
    console.log("\n[sync-photos] productos SIN imágenes:");
    for (const p of unmatchedProducts) console.log(`  - ${p.slug}`);
  }
  if (unmatched.length > 0) {
    console.log("\n[sync-photos] carpetas SIN match:");
    for (const f of unmatched) console.log(`  - ${f}`);
  }

  const matchedCount = products.filter((p) => productFolders.has(p.id)).length;
  console.log(
    `\n[sync-photos] OK: ${matchedCount} productos con imagen, ${totalImages} imgs total`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
