import Filters from "@/components/Filters";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/db";
import styles from "./productos.module.css";

type SearchParams = Promise<{ category?: string; featured?: string }>;

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, featured } = await searchParams;

  const where: { active: boolean; category?: string; featured?: boolean } = {
    active: true,
  };
  if (category) where.category = category;
  if (featured === "1") where.featured = true;

  const [products, allCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: "asc" } }, variants: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const categories = allCategories.map((c) => c.category).sort();

  return (
    <div className={`container ${styles.layout}`}>
      <Filters
        categories={categories}
        activeCategory={category ?? null}
        featuredOnly={featured === "1"}
      />
      <section className={styles.results}>
        <Reveal>
          <header className={styles.header}>
            <h1 className={styles.title}>Catálogo</h1>
            <p className={styles.count}>{products.length} productos</p>
          </header>
        </Reveal>
        <Reveal delay={80}>
          <ProductGrid products={products} />
        </Reveal>
      </section>
    </div>
  );
}
