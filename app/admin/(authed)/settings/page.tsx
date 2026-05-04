import { SETTING_KEYS, getSetting } from "@/lib/settings";
import {
  removeHeaderLogoAction,
  removeHeroImageAction,
  uploadHeaderLogoAction,
  uploadHeroImageAction,
} from "../../actions";
import LogoForm from "./LogoForm";
import styles from "./settings.module.css";

export default async function SettingsPage() {
  const [logoUrl, heroUrl] = await Promise.all([
    getSetting(SETTING_KEYS.HEADER_LOGO_URL),
    getSetting(SETTING_KEYS.HERO_IMAGE_URL),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.lead}>Personalización del sitio</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Logo del header</h2>
        <p className={styles.help}>
          Imagen mostrada en el header del sitio público. Si no hay imagen, se muestra el texto
          &quot;Intima&quot;. Recomendado: PNG/WebP transparente, alto ~80px.
        </p>

        {logoUrl && (
          <div className={styles.current}>
            <span className={styles.label}>Actual</span>
            <div className={styles.preview}>
              <img src={logoUrl} alt="Logo actual" />
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Imagen del Hero (home)</h2>
        <p className={styles.help}>
          Imagen mostrada en el banner principal del home, al lado del título. Recomendado:
          JPG/WebP, formato 4:5 o 1:1, ~1200px ancho. Máx 4MB.
        </p>

        {heroUrl && (
          <div className={styles.currentLarge}>
            <span className={styles.label}>Actual</span>
            <div className={styles.previewLarge}>
              <img src={heroUrl} alt="Hero actual" />
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
    </div>
  );
}
