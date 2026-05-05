import Image from "next/image";
import Link from "next/link";
import { getSiteConfig } from "@/lib/settings";
import styles from "./Hero.module.css";

export default async function Hero() {
  const cfg = await getSiteConfig();
  const imageUrl = cfg.heroImageUrl;
  const hasImage = Boolean(imageUrl);

  return (
    <section className={`${styles.hero} ${hasImage ? styles.heroSplit : ""}`}>
      <div className={styles.orbs} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orb1}`} />
        <span className={`${styles.orb} ${styles.orb2}`} />
        <span className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.dot} />
            {cfg.heroEyebrow}
          </p>

          <h1 className={styles.title}>
            <span className={`${styles.line} ${styles.line1}`}>{cfg.heroTitleLine1}</span>
            <span className={`${styles.line} ${styles.line2}`}>
              <em>{cfg.heroTitleLine2}</em>
            </span>
            <span className={`${styles.line} ${styles.line3}`}>{cfg.heroTitleLine3}</span>
          </h1>

          <p className={styles.lead}>{cfg.heroLead}</p>

          <div className={styles.actions}>
            <Link href={cfg.heroCtaHref} className={styles.cta}>
              {cfg.heroCtaLabel}
              <span className={styles.arrow}>→</span>
            </Link>
            <Link href={cfg.heroCtaGhostHref} className={styles.ctaGhost}>
              {cfg.heroCtaGhostLabel}
            </Link>
          </div>
        </div>

        {hasImage && imageUrl && (
          <div className={styles.media}>
            <span className={styles.mediaTag}>{cfg.heroMediaTag}</span>
            <Image
              src={imageUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 720px) 100vw, (max-width: 1280px) 50vw, 600px"
              className={styles.mediaImg}
            />
          </div>
        )}

        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>scroll</span>
        </div>
      </div>
    </section>
  );
}
