import "server-only";
import { cache } from "react";
import { prisma } from "./db";

export const SETTING_KEYS = {
  BRAND_NAME: "brand_name",
  BRAND_TAGLINE: "brand_tagline",
  SITE_TITLE: "site_title",
  SITE_DESCRIPTION: "site_description",

  HEADER_LOGO_URL: "header_logo_url",
  NAV_LINKS: "nav_links",
  CART_BUTTON_LABEL: "cart_button_label",

  HERO_IMAGE_URL: "hero_image_url",
  HERO_EYEBROW: "hero_eyebrow",
  HERO_TITLE_LINE_1: "hero_title_line_1",
  HERO_TITLE_LINE_2: "hero_title_line_2",
  HERO_TITLE_LINE_3: "hero_title_line_3",
  HERO_LEAD: "hero_lead",
  HERO_CTA_LABEL: "hero_cta_label",
  HERO_CTA_HREF: "hero_cta_href",
  HERO_CTA_GHOST_LABEL: "hero_cta_ghost_label",
  HERO_CTA_GHOST_HREF: "hero_cta_ghost_href",
  HERO_MEDIA_TAG: "hero_media_tag",

  HOME_SECTION_EYEBROW: "home_section_eyebrow",
  HOME_SECTION_TITLE_PRE: "home_section_title_pre",
  HOME_SECTION_TITLE_EM: "home_section_title_em",
  HOME_SECTION_LEAD: "home_section_lead",
  HOME_TRUST_TITLE: "home_trust_title",
  HOME_TRUST_TEXT: "home_trust_text",

  FOOTER_BRAND: "footer_brand",
  FOOTER_COPY: "footer_copy",

  WHATSAPP_PHONE: "whatsapp_phone",
  USD_ARS_RATE: "usd_ars_rate",

  CART_TITLE: "cart_title",
  CART_EMPTY_TEXT: "cart_empty_text",
  CART_CHECKOUT_LABEL: "cart_checkout_label",
  CART_CLEAR_LABEL: "cart_clear_label",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export type NavLink = { label: string; href: string };

export type SiteConfig = {
  brandName: string;
  brandTagline: string;
  siteTitle: string;
  siteDescription: string;

  headerLogoUrl: string | null;
  navLinks: NavLink[];
  cartButtonLabel: string;

  heroImageUrl: string | null;
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleLine3: string;
  heroLead: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  heroCtaGhostLabel: string;
  heroCtaGhostHref: string;
  heroMediaTag: string;

  homeSectionEyebrow: string;
  homeSectionTitlePre: string;
  homeSectionTitleEm: string;
  homeSectionLead: string;
  homeTrustTitle: string;
  homeTrustText: string;

  footerBrand: string;
  footerCopy: string;

  whatsappPhone: string;
  usdArsRate: number;

  cartTitle: string;
  cartEmptyText: string;
  cartCheckoutLabel: string;
  cartClearLabel: string;
};

export const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "Catálogo", href: "/productos" },
  { label: "Destacados", href: "/productos?featured=1" },
];

export const SITE_CONFIG_DEFAULTS: SiteConfig = {
  brandName: "Intima",
  brandTagline: "Lencería curada",
  siteTitle: "Intima — Lencería curada",
  siteDescription: "Selección curada de lencería y conjuntos. Importado, calidad premium.",

  headerLogoUrl: null,
  navLinks: DEFAULT_NAV_LINKS,
  cartButtonLabel: "Carrito",

  heroImageUrl: null,
  heroEyebrow: "Nueva temporada · Importado",
  heroTitleLine1: "Lencería",
  heroTitleLine2: "curada",
  heroTitleLine3: "para vos.",
  heroLead:
    "Selección importada de conjuntos, bralettes y piezas únicas. Calidad premium, precios honestos.",
  heroCtaLabel: "Ver catálogo",
  heroCtaHref: "/productos",
  heroCtaGhostLabel: "Destacados",
  heroCtaGhostHref: "/productos?featured=1",
  heroMediaTag: "Nueva colección",

  homeSectionEyebrow: "Selección",
  homeSectionTitlePre: "Lo más",
  homeSectionTitleEm: "deseado",
  homeSectionLead: "Piezas curadas, listas para enviar.",
  homeTrustTitle: "Pedido por WhatsApp",
  homeTrustText: "Atención personalizada",

  footerBrand: "Intima",
  footerCopy: "Lencería curada",

  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "",
  usdArsRate: Number(process.env.NEXT_PUBLIC_USD_ARS ?? 1200),

  cartTitle: "Tu carrito",
  cartEmptyText: "Tu carrito está vacío.",
  cartCheckoutLabel: "Finalizar por WhatsApp",
  cartClearLabel: "Vaciar carrito",
};

export const getSetting = cache(async (key: SettingKey): Promise<string | null> => {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
});

export const getAllSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
});

function parseNavLinks(raw: string | undefined): NavLink[] {
  if (!raw) return DEFAULT_NAV_LINKS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_NAV_LINKS;
    const out: NavLink[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item.label === "string" &&
        typeof item.href === "string" &&
        item.label.trim() &&
        item.href.trim()
      ) {
        out.push({ label: item.label.trim(), href: item.href.trim() });
      }
    }
    return out.length ? out : DEFAULT_NAV_LINKS;
  } catch {
    return DEFAULT_NAV_LINKS;
  }
}

function pick(map: Record<string, string>, key: SettingKey, fallback: string): string {
  const v = map[key];
  return v && v.length > 0 ? v : fallback;
}

function pickNullable(map: Record<string, string>, key: SettingKey): string | null {
  const v = map[key];
  return v && v.length > 0 ? v : null;
}

function pickNumber(map: Record<string, string>, key: SettingKey, fallback: number): number {
  const v = map[key];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const map = await getAllSettings();
  const d = SITE_CONFIG_DEFAULTS;
  return {
    brandName: pick(map, SETTING_KEYS.BRAND_NAME, d.brandName),
    brandTagline: pick(map, SETTING_KEYS.BRAND_TAGLINE, d.brandTagline),
    siteTitle: pick(map, SETTING_KEYS.SITE_TITLE, d.siteTitle),
    siteDescription: pick(map, SETTING_KEYS.SITE_DESCRIPTION, d.siteDescription),

    headerLogoUrl: pickNullable(map, SETTING_KEYS.HEADER_LOGO_URL),
    navLinks: parseNavLinks(map[SETTING_KEYS.NAV_LINKS]),
    cartButtonLabel: pick(map, SETTING_KEYS.CART_BUTTON_LABEL, d.cartButtonLabel),

    heroImageUrl: pickNullable(map, SETTING_KEYS.HERO_IMAGE_URL),
    heroEyebrow: pick(map, SETTING_KEYS.HERO_EYEBROW, d.heroEyebrow),
    heroTitleLine1: pick(map, SETTING_KEYS.HERO_TITLE_LINE_1, d.heroTitleLine1),
    heroTitleLine2: pick(map, SETTING_KEYS.HERO_TITLE_LINE_2, d.heroTitleLine2),
    heroTitleLine3: pick(map, SETTING_KEYS.HERO_TITLE_LINE_3, d.heroTitleLine3),
    heroLead: pick(map, SETTING_KEYS.HERO_LEAD, d.heroLead),
    heroCtaLabel: pick(map, SETTING_KEYS.HERO_CTA_LABEL, d.heroCtaLabel),
    heroCtaHref: pick(map, SETTING_KEYS.HERO_CTA_HREF, d.heroCtaHref),
    heroCtaGhostLabel: pick(map, SETTING_KEYS.HERO_CTA_GHOST_LABEL, d.heroCtaGhostLabel),
    heroCtaGhostHref: pick(map, SETTING_KEYS.HERO_CTA_GHOST_HREF, d.heroCtaGhostHref),
    heroMediaTag: pick(map, SETTING_KEYS.HERO_MEDIA_TAG, d.heroMediaTag),

    homeSectionEyebrow: pick(map, SETTING_KEYS.HOME_SECTION_EYEBROW, d.homeSectionEyebrow),
    homeSectionTitlePre: pick(map, SETTING_KEYS.HOME_SECTION_TITLE_PRE, d.homeSectionTitlePre),
    homeSectionTitleEm: pick(map, SETTING_KEYS.HOME_SECTION_TITLE_EM, d.homeSectionTitleEm),
    homeSectionLead: pick(map, SETTING_KEYS.HOME_SECTION_LEAD, d.homeSectionLead),
    homeTrustTitle: pick(map, SETTING_KEYS.HOME_TRUST_TITLE, d.homeTrustTitle),
    homeTrustText: pick(map, SETTING_KEYS.HOME_TRUST_TEXT, d.homeTrustText),

    footerBrand: pick(map, SETTING_KEYS.FOOTER_BRAND, d.footerBrand),
    footerCopy: pick(map, SETTING_KEYS.FOOTER_COPY, d.footerCopy),

    whatsappPhone: pick(map, SETTING_KEYS.WHATSAPP_PHONE, d.whatsappPhone),
    usdArsRate: pickNumber(map, SETTING_KEYS.USD_ARS_RATE, d.usdArsRate),

    cartTitle: pick(map, SETTING_KEYS.CART_TITLE, d.cartTitle),
    cartEmptyText: pick(map, SETTING_KEYS.CART_EMPTY_TEXT, d.cartEmptyText),
    cartCheckoutLabel: pick(map, SETTING_KEYS.CART_CHECKOUT_LABEL, d.cartCheckoutLabel),
    cartClearLabel: pick(map, SETTING_KEYS.CART_CLEAR_LABEL, d.cartClearLabel),
  };
});

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function setSettings(entries: Array<[SettingKey, string]>): Promise<void> {
  if (entries.length === 0) return;
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );
}

export async function deleteSetting(key: SettingKey): Promise<void> {
  await prisma.siteSetting.delete({ where: { key } }).catch(() => {});
}
