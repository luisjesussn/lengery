import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/db";
import { getSiteConfig } from "@/lib/settings";
import styles from "./home.module.css";

export default async function HomePage() {
  const [featured, cfg] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { images: { orderBy: { order: "asc" } }, variants: true },
      take: 8,
    }),
    getSiteConfig(),
  ]);

  return (
    <>
      <Hero />

      <section className={`container ${styles.section}`}>
        <Reveal>
          <header className={styles.sectionHead}>
            <p className={styles.eyebrow}>{cfg.homeSectionEyebrow}</p>
            <h2 className={styles.title}>
              {cfg.homeSectionTitlePre} <em>{cfg.homeSectionTitleEm}</em>
            </h2>
            <p className={styles.lead}>{cfg.homeSectionLead}</p>
          </header>
        </Reveal>

        <Reveal delay={120}>
          <ProductGrid products={featured} />
        </Reveal>
      </section>

      <Reveal>
        <section className={styles.trustBar}>
          <div className={`container ${styles.trustInner}`}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✦</span>
              <div>
                <p className={styles.trustTitle}>{cfg.homeTrustTitle}</p>
                <p className={styles.trustText}>{cfg.homeTrustText}</p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
