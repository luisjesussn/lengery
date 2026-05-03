import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.brand}>Intima</p>
        <p className={styles.copy}>© {new Date().getFullYear()} · Lencería curada</p>
      </div>
    </footer>
  );
}
