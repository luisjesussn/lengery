"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  checkLoginRateLimit,
  createSession,
  destroyAllSessions,
  destroySession,
  getClientIp,
  hashPassword,
  recordLoginAttempt,
  requireAuth,
  safeRedirectPath,
  verifyPasswordTimingSafe,
} from "@/lib/auth";
import {
  uploadImage as storageUploadImage,
  deleteImage as storageDeleteImage,
  deleteFolder as storageDeleteFolder,
  pathFromPublicUrl,
} from "@/lib/storage";
import {
  SETTING_KEYS,
  type SettingKey,
  type NavLink,
  deleteSetting,
  setSetting,
  setSettings,
} from "@/lib/settings";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const from = safeRedirectPath(formData.get("from"));

  if (!email || !password) {
    return { error: "Faltan datos" };
  }

  const ip = await getClientIp();
  const rate = await checkLoginRateLimit(email, ip);
  if (!rate.ok) {
    return {
      error: `Demasiados intentos. Esperá ${Math.ceil(rate.retryAfterSec / 60)} min.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await verifyPasswordTimingSafe(password, user?.passwordHash ?? null);

  await recordLoginAttempt(email, ip, ok);

  if (!ok || !user) return { error: "Credenciales inválidas" };

  await createSession(user.id);
  redirect(from);
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function logoutAllAction() {
  const user = await requireAuth();
  await destroyAllSessions(user.id);
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
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") !== "off";

  if (!name || !category || !Number.isFinite(costUSD)) {
    throw new Error("Datos inválidos");
  }

  let slug = slugify(`${category}-${name}`);
  let suffix = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix++;
    slug = `${slugify(`${category}-${name}`)}-${suffix}`;
  }

  const product = await prisma.product.create({
    data: { name, category, description, costUSD, featured, active, slug },
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
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") === "on";

  await prisma.product.update({
    where: { id },
    data: { name, category, description, costUSD, featured, active },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/productos/${id}`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await storageDeleteFolder(product.slug).catch(() => {});

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

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

function detectImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return "image/png";
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return "image/webp";
  if (
    buf[4] === 0x66 &&
    buf[5] === 0x74 &&
    buf[6] === 0x79 &&
    buf[7] === 0x70 &&
    buf[8] === 0x61 &&
    buf[9] === 0x76 &&
    (buf[10] === 0x69 || buf[10] === 0x66)
  )
    return "image/avif";
  return null;
}

export async function uploadImageAction(formData: FormData): Promise<void> {
  await requireAuth();
  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("file") as File | null;
  const color = String(formData.get("color") ?? "").trim() || null;

  if (!productId || !file || !file.size) return;
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Archivo demasiado grande (máx ${MAX_UPLOAD_BYTES / 1024 / 1024}MB)`);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const buf = Buffer.from(await file.arrayBuffer());
  const detected = detectImageMime(buf);
  if (!detected) {
    throw new Error("Tipo de imagen no soportado (jpg, png, webp, avif)");
  }
  const ext = EXT_BY_MIME[detected];

  const last = await prisma.image.findFirst({
    where: { productId },
    orderBy: { order: "desc" },
  });
  const order = (last?.order ?? -1) + 1;
  const dstName = `up-${Date.now()}${ext}`;
  const path = `${product.slug}/${dstName}`;

  const url = await storageUploadImage(path, buf, detected);

  await prisma.image.create({
    data: {
      productId,
      url,
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
    const path = pathFromPublicUrl(img.url);
    if (path) await storageDeleteImage(path).catch(() => {});
    await prisma.image.delete({ where: { id } });
  }

  revalidatePath(`/admin/productos/${productId}`);
}


export async function uploadHeaderLogoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) {
    throw new Error("Falta archivo");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Archivo demasiado grande (máx ${MAX_UPLOAD_BYTES / 1024 / 1024}MB)`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const detected = detectImageMime(buf);
  if (!detected) {
    throw new Error("Tipo de imagen no soportado (jpg, png, webp, avif)");
  }
  const ext = EXT_BY_MIME[detected];
  const path = `site/header-logo-${Date.now()}${ext}`;

  const url = await storageUploadImage(path, buf, detected);
  await setSetting(SETTING_KEYS.HEADER_LOGO_URL, url);

  revalidatePath("/", "layout");
}

export async function removeHeaderLogoAction(): Promise<void> {
  await requireAuth();
  await deleteSetting(SETTING_KEYS.HEADER_LOGO_URL);
  revalidatePath("/", "layout");
}

const MAX_HERO_BYTES = 4 * 1024 * 1024;

export async function uploadHeroImageAction(formData: FormData): Promise<void> {
  await requireAuth();
  const file = formData.get("file") as File | null;
  if (!file || !file.size) {
    throw new Error("Falta archivo");
  }
  if (file.size > MAX_HERO_BYTES) {
    throw new Error(`Archivo demasiado grande (máx ${MAX_HERO_BYTES / 1024 / 1024}MB)`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const detected = detectImageMime(buf);
  if (!detected) {
    throw new Error("Tipo de imagen no soportado (jpg, png, webp, avif)");
  }
  const ext = EXT_BY_MIME[detected];
  const path = `site/hero-${Date.now()}${ext}`;

  const url = await storageUploadImage(path, buf, detected);
  await setSetting(SETTING_KEYS.HERO_IMAGE_URL, url);

  revalidatePath("/", "layout");
}

export async function removeHeroImageAction(): Promise<void> {
  await requireAuth();
  await deleteSetting(SETTING_KEYS.HERO_IMAGE_URL);
  revalidatePath("/", "layout");
}

const TEXT_KEYS_BY_SECTION: Record<string, SettingKey[]> = {
  brand: [
    SETTING_KEYS.BRAND_NAME,
    SETTING_KEYS.BRAND_TAGLINE,
    SETTING_KEYS.SITE_TITLE,
    SETTING_KEYS.SITE_DESCRIPTION,
  ],
  header: [SETTING_KEYS.CART_BUTTON_LABEL],
  hero: [
    SETTING_KEYS.HERO_EYEBROW,
    SETTING_KEYS.HERO_TITLE_LINE_1,
    SETTING_KEYS.HERO_TITLE_LINE_2,
    SETTING_KEYS.HERO_TITLE_LINE_3,
    SETTING_KEYS.HERO_LEAD,
    SETTING_KEYS.HERO_CTA_LABEL,
    SETTING_KEYS.HERO_CTA_HREF,
    SETTING_KEYS.HERO_CTA_GHOST_LABEL,
    SETTING_KEYS.HERO_CTA_GHOST_HREF,
    SETTING_KEYS.HERO_MEDIA_TAG,
  ],
  home: [
    SETTING_KEYS.HOME_SECTION_EYEBROW,
    SETTING_KEYS.HOME_SECTION_TITLE_PRE,
    SETTING_KEYS.HOME_SECTION_TITLE_EM,
    SETTING_KEYS.HOME_SECTION_LEAD,
    SETTING_KEYS.HOME_TRUST_TITLE,
    SETTING_KEYS.HOME_TRUST_TEXT,
  ],
  footer: [SETTING_KEYS.FOOTER_BRAND, SETTING_KEYS.FOOTER_COPY],
  contact: [SETTING_KEYS.WHATSAPP_PHONE, SETTING_KEYS.USD_ARS_RATE],
  cart: [
    SETTING_KEYS.CART_TITLE,
    SETTING_KEYS.CART_EMPTY_TEXT,
    SETTING_KEYS.CART_CHECKOUT_LABEL,
    SETTING_KEYS.CART_CLEAR_LABEL,
  ],
};

export async function updateSiteConfigSectionAction(formData: FormData): Promise<void> {
  await requireAuth();
  const section = String(formData.get("__section") ?? "");
  const allowed = TEXT_KEYS_BY_SECTION[section];
  if (!allowed) throw new Error("Sección inválida");

  if (section === "contact") {
    const phoneRaw = String(formData.get(SETTING_KEYS.WHATSAPP_PHONE) ?? "").trim();
    const phone = phoneRaw.replace(/[^\d+]/g, "");
    const rateRaw = String(formData.get(SETTING_KEYS.USD_ARS_RATE) ?? "").trim();
    const rate = Number(rateRaw);
    const entries: Array<[SettingKey, string]> = [];
    const toDelete: SettingKey[] = [];
    if (phone) entries.push([SETTING_KEYS.WHATSAPP_PHONE, phone]);
    else toDelete.push(SETTING_KEYS.WHATSAPP_PHONE);
    if (rateRaw && Number.isFinite(rate) && rate > 0) {
      entries.push([SETTING_KEYS.USD_ARS_RATE, String(rate)]);
    } else if (!rateRaw) {
      toDelete.push(SETTING_KEYS.USD_ARS_RATE);
    }
    await setSettings(entries);
    for (const k of toDelete) await deleteSetting(k);
    revalidatePath("/", "layout");
    return;
  }

  const entries: Array<[SettingKey, string]> = [];
  const toDelete: SettingKey[] = [];
  for (const key of allowed) {
    const raw = formData.get(key);
    if (raw === null) continue;
    const value = String(raw).trim();
    if (value) entries.push([key, value]);
    else toDelete.push(key);
  }
  await setSettings(entries);
  for (const k of toDelete) await deleteSetting(k);
  revalidatePath("/", "layout");
}

export async function updateNavLinksAction(formData: FormData): Promise<void> {
  await requireAuth();
  const labels = formData.getAll("nav_label").map((v) => String(v).trim());
  const hrefs = formData.getAll("nav_href").map((v) => String(v).trim());
  const links: NavLink[] = [];
  for (let i = 0; i < Math.max(labels.length, hrefs.length); i++) {
    const label = labels[i] ?? "";
    const href = hrefs[i] ?? "";
    if (label && href) links.push({ label, href });
  }
  if (links.length === 0) {
    await deleteSetting(SETTING_KEYS.NAV_LINKS);
  } else {
    await setSetting(SETTING_KEYS.NAV_LINKS, JSON.stringify(links));
  }
  revalidatePath("/", "layout");
}
