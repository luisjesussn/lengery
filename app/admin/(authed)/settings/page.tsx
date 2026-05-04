import { SETTING_KEYS, getSetting } from "@/lib/settings";
import {
  removeHeaderLogoAction,
  uploadHeaderLogoAction,
} from "../../actions";
import LogoForm from "./LogoForm";
import styles from "./settings.module.css";

export default async function SettingsPage() {
  const logoUrl = await getSetting(SETTING_KEYS.HEADER_LOGO_URL);

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

        <LogoForm uploadAction={uploadHeaderLogoAction} />
      </section>
    </div>
  );
}
