import PriceTag from "@/components/PriceTag";
import VariantSelector from "@/components/VariantSelector";
import type { ProductWithRelations } from "@/lib/types";
import styles from "./ProductInfo.module.css";

export default function ProductInfo({ product }: { product: ProductWithRelations }) {
  return (
    <div className={styles.info}>
      <p className={styles.category}>{product.category}</p>
      <h1 className={styles.name}>{product.name}</h1>
      <PriceTag costUSD={product.costUSD} marginPct={product.marginPct} size="lg" />
      {product.description && <p className={styles.desc}>{product.description}</p>}
      <VariantSelector product={product} />
    </div>
  );
}
