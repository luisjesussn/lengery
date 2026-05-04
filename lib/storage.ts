import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEYS ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

export const STORAGE_BUCKET = "product-images";

let _client: SupabaseClient | null = null;
function client(): SupabaseClient {
  if (_client) return _client;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Faltan SUPABASE_URL / SUPABASE_SECRET_KEYS env vars");
  }
  _client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
  return _client;
}

export function publicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

export function pathFromPublicUrl(url: string): string | null {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

export async function uploadImage(
  path: string,
  buf: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await client()
    .storage.from(STORAGE_BUCKET)
    .upload(path, buf, { contentType, upsert: true });
  if (error) throw new Error(`Storage upload: ${error.message}`);
  return publicUrl(path);
}

export async function deleteImage(path: string): Promise<void> {
  await client().storage.from(STORAGE_BUCKET).remove([path]);
}

export async function deleteFolder(prefix: string): Promise<void> {
  const { data, error } = await client()
    .storage.from(STORAGE_BUCKET)
    .list(prefix, { limit: 1000 });
  if (error || !data) return;
  const paths = data.map((f) => `${prefix}/${f.name}`);
  if (paths.length > 0) {
    await client().storage.from(STORAGE_BUCKET).remove(paths);
  }
}
