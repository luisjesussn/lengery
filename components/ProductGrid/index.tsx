import ProductCard from "@/components/ProductCard";
import type { ProductWithRelations } from "@/lib/types";
import styles from "./ProductGrid.module.css";

export default function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) {
    return <p className={styles.empty}>No hay productos para mostrar.</p>;
  }

  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
