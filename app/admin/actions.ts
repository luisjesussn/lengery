"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join, extname } from "node:path";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  requireAuth,
  verifyPassword,
} from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!email || !password) {
    return { error: "Faltan datos" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Credenciales inválidas" };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Credenciales inválidas" };

  await createSession(user.id);
  redirect(from || "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
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

export async function createProductAction(formData: FormData): Promise<void> {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const costUSD = Number(formData.get("costUSD"));
  const marginPct = Number(formData.get("marginPct"));
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") !== "off";

  if (!name || !category || !Number.isFinite(costUSD) || !Number.isFinite(marginPct)) {
    throw new Error("Datos inválidos");
  }

  let slug = slugify(`${category}-${name}`);
  let suffix = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${slugify(`${category}-${name}`)}-${suffix}`;
  }

  const product = await prisma.product.create({
    data: { name, category, description, costUSD, marginPct, featured, active, slug },
  });

  revalidatePath("/admin");
  redirect(`/admin/productos/${product.id}`);
}

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const costUSD = Number(formData.get("costUSD"));
  const marginPct = Number(formData.get("marginPct"));
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") === "on";

  await prisma.product.update({
    where: { id },
    data: { name, category, description, costUSD, marginPct, featured, active },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/productos/${id}`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  const dir = resolve(process.cwd(), "public", "products", product.slug);
  if (existsSync(dir)) {
    const files = await readdir(dir);
    for (const f of files) await unlink(join(dir, f)).catch(() => {});
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function addVariantAction(formData: FormData): Promise<void> {
  await requireAuth();
  const productId = String(formData.get("productId") ?? "");
  const size = String(formData.get("size") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || null;
  const stock = Number(formData.get("stock") ?? 0);

  if (!productId || !size) return;

  await prisma.variant
    .create({ data: { productId, size, color, stock } })
    .catch(() => null);

  revalidatePath(`/admin/productos/${productId}`);
}

export async function updateVariantAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const stock = Number(formData.get("stock") ?? 0);
  const productId = String(formData.get("productId") ?? "");

  await prisma.variant.update({ where: { id }, data: { stock } });
  revalidatePath(`/admin/productos/${productId}`);
}

export async function deleteVariantAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  await prisma.variant.delete({ where: { id } });
  revalidatePath(`/admin/productos/${productId}`);
}

export async function uploadImageAction(formData: FormData): Promise<void> {
  await requireAuth();
  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("file") as File | null;
  const color = String(formData.get("color") ?? "").trim() || null;

  if (!productId || !file || !file.size) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const dir = resolve(process.cwd(), "public", "products", product.slug);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  const ext = extname(file.name).toLowerCase() || ".jpg";
  const last = await prisma.image.findFirst({
    where: { productId },
    orderBy: { order: "desc" },
  });
  const order = (last?.order ?? -1) + 1;
  const dstName = `up-${Date.now()}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, dstName), buf);

  await prisma.image.create({
    data: {
      productId,
      url: `/products/${product.slug}/${dstName}`,
      alt: product.name,
      color,
      order,
    },
  });

  revalidatePath(`/admin/productos/${productId}`);
}

export async function updateImageAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const color = String(formData.get("color") ?? "").trim() || null;
  const order = Number(formData.get("order") ?? 0);

  await prisma.image.update({ where: { id }, data: { color, order } });
  revalidatePath(`/admin/productos/${productId}`);
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");

  const img = await prisma.image.findUnique({ where: { id } });
  if (img) {
    const filePath = resolve(process.cwd(), "public", img.url.replace(/^\//, ""));
    await unlink(filePath).catch(() => {});
    await prisma.image.delete({ where: { id } });
  }

  revalidatePath(`/admin/productos/${productId}`);
}
