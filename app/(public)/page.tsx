import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/db";
import styles from "./home.module.css";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { images: { orderBy: { order: "asc" } }, variants: true },
    take: 8,
  });

  return (
    <>
      <Hero />

      <section className={`container ${styles.section}`}>
        <Reveal>
          <header className={styles.sectionHead}>
            <p className={styles.eyebrow}>Selección</p>
            <h2 className={styles.title}>
              Lo más <em>deseado</em>
            </h2>
            <p className={styles.lead}>Piezas curadas, listas para enviar.</p>
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
                <p className={styles.trustTitle}>Envío rápido</p>
                <p className={styles.trustText}>3–5 días a CABA y GBA</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✦</span>
              <div>
                <p className={styles.trustTitle}>Cambios garantizados</p>
                <p className={styles.trustText}>Si no te queda, lo cambiamos</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✦</span>
              <div>
                <p className={styles.trustTitle}>Pedido por WhatsApp</p>
                <p className={styles.trustText}>Atención personalizada</p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
