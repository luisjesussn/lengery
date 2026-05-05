import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CSV_PATH = resolve(process.cwd(), "data.csv");

function parseMoney(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/\$/g, "").replace(/\s/g, "").trim();
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

type Parsed = {
  category: string;
  baseName: string;
  color: string | null;
  size: string;
  costUSD: number;
};

function parseProductString(producto: string): { baseName: string; color: string | null; size: string } {
  const cleaned = producto.replace(/\s*\(conjunto \d+ de \d+\)\s*$/i, "").trim();
  const m = cleaned.match(/^(.+?)\s+-\s+(.+?)\s*\/\s*(.+)$/);
  if (m) {
    return { baseName: m[1].trim(), color: m[2].trim(), size: m[3].trim() };
  }
  const slashMatch = cleaned.match(/^(.+?)\s*\/\s*(.+)$/);
  if (slashMatch) {
    return { baseName: slashMatch[1].trim(), color: null, size: slashMatch[2].trim() };
  }
  return { baseName: cleaned, color: null, size: "Único" };
}

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.warn(`[seed] data.csv no encontrado en ${CSV_PATH}, skip.`);
    return;
  }

  const raw = readFileSync(CSV_PATH, "utf8");
  const rows: string[][] = parse(raw, { skip_empty_lines: false, relax_column_count: true });

  const headerIdx = rows.findIndex((r) => r[0]?.trim().toLowerCase() === "paquete");
  if (headerIdx === -1) {
    console.error("[seed] no se encontró fila header (Paquete,Producto,...)");
    return;
  }

  const dataRows = rows.slice(headerIdx + 1).filter((r) => r[0] && r[1]);

  const parsed: Parsed[] = dataRows.map((r) => {
    const { baseName, color, size } = parseProductString(r[1]);
    return {
      category: r[0].trim(),
      baseName,
      color,
      size,
      costUSD: parseMoney(r[4]),
    };
  });

  const grouped = new Map<string, Parsed[]>();
  for (const p of parsed) {
    const key = `${p.category}::${p.baseName}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }

  console.log(`[seed] ${parsed.length} filas → ${grouped.size} productos únicos`);

  await prisma.variant.deleteMany();
  await prisma.image.deleteMany();
  await prisma.product.deleteMany();

  let created = 0;
  for (const [key, items] of grouped) {
    const first = items[0];
    const baseSlug = slugify(`${first.category}-${first.baseName}`);
    const slug = baseSlug || `producto-${created}`;

    const variantMap = new Map<string, { size: string; color: string | null; stock: number }>();
    for (const it of items) {
      const vKey = `${it.size}::${it.color ?? ""}`;
      const existing = variantMap.get(vKey);
      if (existing) existing.stock += 1;
      else variantMap.set(vKey, { size: it.size, color: it.color, stock: 1 });
    }

    await prisma.product.create({
      data: {
        slug,
        name: first.baseName,
        category: first.category,
        costUSD: first.costUSD,
        featured: created < 6,
        variants: {
          create: Array.from(variantMap.values()),
        },
      },
    });
    created++;
  }

  console.log(`[seed] ${created} productos cargados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
