import { getSiteConfig } from "@/lib/settings";
import styles from "./Footer.module.css";

export default async function Footer() {
  const cfg = await getSiteConfig();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.brand}>{cfg.footerBrand}</p>
        <p className={styles.copy}>
          © {new Date().getFullYear()} · {cfg.footerCopy}
        </p>
      </div>
    </footer>
  );
}
