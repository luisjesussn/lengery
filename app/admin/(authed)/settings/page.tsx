import {
  SETTING_KEYS,
  SITE_CONFIG_DEFAULTS,
  getAllSettings,
  getSiteConfig,
} from "@/lib/settings";
import {
  removeHeaderLogoAction,
  removeHeroImageAction,
  updateNavLinksAction,
  updateSiteConfigSectionAction,
  uploadHeaderLogoAction,
  uploadHeroImageAction,
} from "../../actions";
import LogoForm from "./LogoForm";
import NavLinksForm from "./NavLinksForm";
import SettingsTextForm, { type SettingsField } from "./SettingsTextForm";
import styles from "./settings.module.css";

export default async function SettingsPage() {
  const [raw, cfg] = await Promise.all([getAllSettings(), getSiteConfig()]);
  const get = (k: string) => raw[k] ?? "";
  const d = SITE_CONFIG_DEFAULTS;

  const brandFields: SettingsField[] = [
    {
      key: SETTING_KEYS.BRAND_NAME,
      label: "Nombre de la marca",
      currentValue: get(SETTING_KEYS.BRAND_NAME),
      defaultValue: d.brandName,
    },
    {
      key: SETTING_KEYS.BRAND_TAGLINE,
      label: "Tagline / descripción corta",
      currentValue: get(SETTING_KEYS.BRAND_TAGLINE),
      defaultValue: d.brandTagline,
    },
    {
      key: SETTING_KEYS.SITE_TITLE,
      label: "Título del sitio (SEO / pestaña)",
      currentValue: get(SETTING_KEYS.SITE_TITLE),
      defaultValue: d.siteTitle,
    },
    {
      key: SETTING_KEYS.SITE_DESCRIPTION,
      label: "Descripción meta (SEO)",
      type: "textarea",
      currentValue: get(SETTING_KEYS.SITE_DESCRIPTION),
      defaultValue: d.siteDescription,
    },
  ];

  const headerFields: SettingsField[] = [
    {
      key: SETTING_KEYS.CART_BUTTON_LABEL,
      label: "Botón del carrito",
      currentValue: get(SETTING_KEYS.CART_BUTTON_LABEL),
      defaultValue: d.cartButtonLabel,
    },
  ];

  const heroFields: SettingsField[] = [
    {
      key: SETTING_KEYS.HERO_EYEBROW,
      label: "Eyebrow (texto pequeño arriba)",
      currentValue: get(SETTING_KEYS.HERO_EYEBROW),
      defaultValue: d.heroEyebrow,
    },
    {
      key: SETTING_KEYS.HERO_TITLE_LINE_1,
      label: "Título — línea 1",
      currentValue: get(SETTING_KEYS.HERO_TITLE_LINE_1),
      defaultValue: d.heroTitleLine1,
    },
    {
      key: SETTING_KEYS.HERO_TITLE_LINE_2,
      label: "Título — línea 2 (en cursiva)",
      currentValue: get(SETTING_KEYS.HERO_TITLE_LINE_2),
      defaultValue: d.heroTitleLine2,
    },
    {
      key: SETTING_KEYS.HERO_TITLE_LINE_3,
      label: "Título — línea 3",
      currentValue: get(SETTING_KEYS.HERO_TITLE_LINE_3),
      defaultValue: d.heroTitleLine3,
    },
    {
      key: SETTING_KEYS.HERO_LEAD,
      label: "Texto descriptivo (lead)",
      type: "textarea",
      currentValue: get(SETTING_KEYS.HERO_LEAD),
      defaultValue: d.heroLead,
    },
    {
      key: SETTING_KEYS.HERO_CTA_LABEL,
      label: "Botón principal — texto",
      currentValue: get(SETTING_KEYS.HERO_CTA_LABEL),
      defaultValue: d.heroCtaLabel,
    },
    {
      key: SETTING_KEYS.HERO_CTA_HREF,
      label: "Botón principal — destino",
      currentValue: get(SETTING_KEYS.HERO_CTA_HREF),
      defaultValue: d.heroCtaHref,
    },
    {
      key: SETTING_KEYS.HERO_CTA_GHOST_LABEL,
      label: "Botón secundario — texto",
      currentValue: get(SETTING_KEYS.HERO_CTA_GHOST_LABEL),
      defaultValue: d.heroCtaGhostLabel,
    },
    {
      key: SETTING_KEYS.HERO_CTA_GHOST_HREF,
      label: "Botón secundario — destino",
      currentValue: get(SETTING_KEYS.HERO_CTA_GHOST_HREF),
      defaultValue: d.heroCtaGhostHref,
    },
    {
      key: SETTING_KEYS.HERO_MEDIA_TAG,
      label: "Etiqueta sobre la imagen",
      currentValue: get(SETTING_KEYS.HERO_MEDIA_TAG),
      defaultValue: d.heroMediaTag,
    },
  ];

  const homeFields: SettingsField[] = [
    {
      key: SETTING_KEYS.HOME_SECTION_EYEBROW,
      label: "Eyebrow de sección destacados",
      currentValue: get(SETTING_KEYS.HOME_SECTION_EYEBROW),
      defaultValue: d.homeSectionEyebrow,
    },
    {
      key: SETTING_KEYS.HOME_SECTION_TITLE_PRE,
      label: "Título — texto antes de la cursiva",
      currentValue: get(SETTING_KEYS.HOME_SECTION_TITLE_PRE),
      defaultValue: d.homeSectionTitlePre,
    },
    {
      key: SETTING_KEYS.HOME_SECTION_TITLE_EM,
      label: "Título — palabra en cursiva",
      currentValue: get(SETTING_KEYS.HOME_SECTION_TITLE_EM),
      defaultValue: d.homeSectionTitleEm,
    },
    {
      key: SETTING_KEYS.HOME_SECTION_LEAD,
      label: "Lead de sección destacados",
      type: "textarea",
      currentValue: get(SETTING_KEYS.HOME_SECTION_LEAD),
      defaultValue: d.homeSectionLead,
    },
    {
      key: SETTING_KEYS.HOME_TRUST_TITLE,
      label: "Trust bar — título",
      currentValue: get(SETTING_KEYS.HOME_TRUST_TITLE),
      defaultValue: d.homeTrustTitle,
    },
    {
      key: SETTING_KEYS.HOME_TRUST_TEXT,
      label: "Trust bar — descripción",
      currentValue: get(SETTING_KEYS.HOME_TRUST_TEXT),
      defaultValue: d.homeTrustText,
    },
  ];

  const footerFields: SettingsField[] = [
    {
      key: SETTING_KEYS.FOOTER_BRAND,
      label: "Marca en el footer",
      currentValue: get(SETTING_KEYS.FOOTER_BRAND),
      defaultValue: d.footerBrand,
    },
    {
      key: SETTING_KEYS.FOOTER_COPY,
      label: "Texto del copyright",
      currentValue: get(SETTING_KEYS.FOOTER_COPY),
      defaultValue: d.footerCopy,
    },
  ];

  const contactFields: SettingsField[] = [
    {
      key: SETTING_KEYS.WHATSAPP_PHONE,
      label: "Teléfono WhatsApp",
      type: "tel",
      currentValue: get(SETTING_KEYS.WHATSAPP_PHONE),
      placeholder: "+5491112345678",
      help: "Sólo números, opcionalmente con prefijo + (ej: +5491112345678).",
    },
    {
      key: SETTING_KEYS.USD_ARS_RATE,
      label: "Cotización USD → ARS",
      type: "number",
      step: "0.01",
      min: "1",
      currentValue: get(SETTING_KEYS.USD_ARS_RATE),
      placeholder: String(d.usdArsRate),
      help: "Usado para mostrar precios en pesos.",
    },
  ];

  const cartFields: SettingsField[] = [
    {
      key: SETTING_KEYS.CART_TITLE,
      label: "Título del carrito",
      currentValue: get(SETTING_KEYS.CART_TITLE),
      defaultValue: d.cartTitle,
    },
    {
      key: SETTING_KEYS.CART_EMPTY_TEXT,
      label: "Texto cuando está vacío",
      currentValue: get(SETTING_KEYS.CART_EMPTY_TEXT),
      defaultValue: d.cartEmptyText,
    },
    {
      key: SETTING_KEYS.CART_CHECKOUT_LABEL,
      label: "Botón finalizar (WhatsApp)",
      currentValue: get(SETTING_KEYS.CART_CHECKOUT_LABEL),
      defaultValue: d.cartCheckoutLabel,
    },
    {
      key: SETTING_KEYS.CART_CLEAR_LABEL,
      label: "Botón vaciar carrito",
      currentValue: get(SETTING_KEYS.CART_CLEAR_LABEL),
      defaultValue: d.cartClearLabel,
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.lead}>
          Editá los textos, enlaces, imágenes y datos de contacto del sitio. Si dejás un
          campo vacío vuelve al valor por defecto.
        </p>
      </header>

      <SettingsTextForm
        section="brand"
        title="Marca y SEO"
        description="Nombre, tagline, título de pestaña y descripción para buscadores."
        fields={brandFields}
        action={updateSiteConfigSectionAction}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Logo del header</h2>
        <p className={styles.help}>
          Si no hay imagen, se muestra el nombre de marca. Recomendado: PNG/WebP transparente,
          alto ~80px.
        </p>

        {cfg.headerLogoUrl && (
          <div className={styles.current}>
            <span className={styles.label}>Actual</span>
            <div className={styles.preview}>
              <img src={cfg.headerLogoUrl} alt="Logo actual" />
            </div>
            <form action={removeHeaderLogoAction}>
              <button type="submit" className={styles.removeBtn}>
                Quitar logo
              </button>
            </form>
          </div>
        )}

        <LogoForm
          uploadAction={uploadHeaderLogoAction}
          label="Guardar logo"
          pickerText="Click para elegir logo"
          hint="JPG, PNG, WebP, AVIF · máx 5MB"
        />
      </section>

      <SettingsTextForm
        section="header"
        title="Header — textos"
        fields={headerFields}
        action={updateSiteConfigSectionAction}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Navegación del header</h2>
        <p className={styles.help}>
          Enlaces que aparecen en el menú principal. Podés agregar, quitar y reordenar.
        </p>
        <NavLinksForm current={cfg.navLinks} action={updateNavLinksAction} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Imagen del Hero (home)</h2>
        <p className={styles.help}>
          Imagen mostrada en el banner principal del home, al lado del título. Recomendado:
          JPG/WebP, formato 4:5 o 1:1, ~1200px ancho. Máx 4MB.
        </p>

        {cfg.heroImageUrl && (
          <div className={styles.currentLarge}>
            <span className={styles.label}>Actual</span>
            <div className={styles.previewLarge}>
              <img src={cfg.heroImageUrl} alt="Hero actual" />
            </div>
            <form action={removeHeroImageAction}>
              <button type="submit" className={styles.removeBtn}>
                Quitar imagen
              </button>
            </form>
          </div>
        )}

        <LogoForm
          uploadAction={uploadHeroImageAction}
          label="Guardar imagen"
          pickerText="Click para elegir imagen del Hero"
          hint="JPG, PNG, WebP, AVIF · máx 4MB"
        />
      </section>

      <SettingsTextForm
        section="hero"
        title="Hero — textos y botones"
        description="Textos del banner principal del home."
        fields={heroFields}
        action={updateSiteConfigSectionAction}
      />

      <SettingsTextForm
        section="home"
        title="Home — sección destacados y trust bar"
        fields={homeFields}
        action={updateSiteConfigSectionAction}
      />

      <SettingsTextForm
        section="cart"
        title="Carrito — textos"
        fields={cartFields}
        action={updateSiteConfigSectionAction}
      />

      <SettingsTextForm
        section="footer"
        title="Footer"
        fields={footerFields}
        action={updateSiteConfigSectionAction}
      />

      <SettingsTextForm
        section="contact"
        title="Contacto y precios"
        description="Número de WhatsApp para checkout y cotización del dólar."
        fields={contactFields}
        action={updateSiteConfigSectionAction}
      />
    </div>
  );
}
