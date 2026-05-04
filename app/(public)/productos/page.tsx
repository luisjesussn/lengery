import Filters from "@/components/Filters";
import Pagination from "@/components/Pagination";
import ProductGrid from "@/components/ProductGrid";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/db";
import styles from "./productos.module.css";

const PER_PAGE = 12;

type SearchParams = Promise<{ category?: string; featured?: string; page?: string }>;

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, featured, page: pageParam } = await searchParams;

  const where: { active: boolean; category?: string; featured?: boolean } = {
    active: true,
  };
  if (category) where.category = category;
  if (featured === "1") where.featured = true;

  const requestedPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [total, allCategories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(requestedPage, totalPages);

  const products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { order: "asc" } }, variants: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  const categories = allCategories.map((c) => c.category).sort();

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (featured === "1") sp.set("featured", "1");
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/productos?${qs}` : "/productos";
  };

  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

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
            <p className={styles.count}>
              {total === 0
                ? "Sin productos"
                : `${from}–${to} de ${total} productos`}
            </p>
          </header>
        </Reveal>
        <Reveal delay={80}>
          <ProductGrid products={products} />
        </Reveal>
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </section>
    </div>
  );
}
