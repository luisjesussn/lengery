import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://ketsrkymlsnbtdslrsqf.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEYS || process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "product-images";
const SRC_DIR = resolve(process.cwd(), "public", "products");

if (!SUPABASE_KEY) {
  console.error("Falta SUPABASE_SECRET_KEYS en .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});
const prisma = new PrismaClient();

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

async function main() {
  const productSlugs = readdirSync(SRC_DIR).filter((f) =>
    statSync(join(SRC_DIR, f)).isDirectory()
  );

  console.log(`[upload] ${productSlugs.length} carpetas a subir`);

  let uploaded = 0;
  let failed = 0;

  for (const slug of productSlugs) {
    const dir = join(SRC_DIR, slug);
    const files = readdirSync(dir).filter((f) => MIME[extname(f).toLowerCase()]);

    for (const file of files) {
      const localPath = join(dir, file);
      const storagePath = `${slug}/${file}`;
      const buf = readFileSync(localPath);
      const contentType = MIME[extname(file).toLowerCase()];

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buf, { contentType, upsert: true });

      if (error) {
        console.error(`  FAIL ${storagePath}: ${error.message}`);
        failed++;
        continue;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;

      const oldUrl = `/products/${storagePath}`;
      const updated = await prisma.image.updateMany({
        where: { url: oldUrl },
        data: { url: publicUrl },
      });

      uploaded++;
      if (uploaded % 20 === 0) console.log(`  ${uploaded} subidas...`);
      if (updated.count === 0) console.warn(`  WARN no Image row para ${oldUrl}`);
    }
  }

  console.log(`\n[upload] OK: ${uploaded} subidas, ${failed} fallaron`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
