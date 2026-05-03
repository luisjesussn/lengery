import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.orbs} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orb1}`} />
        <span className={`${styles.orb} ${styles.orb2}`} />
        <span className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>
          <span className={styles.dot} />
          Nueva temporada · Importado
        </p>

        <h1 className={styles.title}>
          <span className={`${styles.line} ${styles.line1}`}>Lencería</span>
          <span className={`${styles.line} ${styles.line2}`}>
            <em>curada</em>
          </span>
          <span className={`${styles.line} ${styles.line3}`}>para vos.</span>
        </h1>

        <p className={styles.lead}>
          Selección importada de conjuntos, bralettes y piezas únicas. Calidad premium,
          precios honestos.
        </p>

        <div className={styles.actions}>
          <Link href="/productos" className={styles.cta}>
            Ver catálogo
            <span className={styles.arrow}>→</span>
          </Link>
          <Link href="/productos?featured=1" className={styles.ctaGhost}>
            Destacados
          </Link>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>scroll</span>
        </div>
      </div>
    </section>
  );
}
