import ProductCard from "@/components/ProductCard";
import type { ProductWithRelations } from "@/lib/types";
import styles from "./ProductGrid.module.css";

const PRIORITY_COUNT = 4;

export default function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) {
    return <p className={styles.empty}>No hay productos para mostrar.</p>;
  }

  return (
    <div className={styles.grid}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < PRIORITY_COUNT} />
      ))}
    </div>
  );
}
