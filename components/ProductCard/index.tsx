import Link from "next/link";
import PriceTag from "@/components/PriceTag";
import type { ProductWithRelations } from "@/lib/types";
import styles from "./ProductCard.module.css";

const COLOR_MAP: Record<string, string> = {
  negro: "#1a1612",
  blanco: "#f5f1ec",
  rojo: "#b8362a",
  rosa: "#e8a8b0",
  "rosa rojo": "#d96576",
  burdeos: "#6b1e2c",
  verde: "#5a7a55",
  azul: "#3a5a7a",
  "azul y blanco": "#5e7fa1",
  marrón: "#6e4a32",
  marron: "#6e4a32",
  "púrpura malva": "#9a7d96",
  purpura: "#7c4a86",
  beige: "#d4b89a",
  nude: "#e6c9b3",
  gris: "#8c8780",
  amarillo: "#e0b84a",
  naranja: "#d8814a",
};

function colorSwatch(name: string): string {
  const k = name.toLowerCase().trim();
  return COLOR_MAP[k] ?? "linear-gradient(135deg, #d4b89a, #c4756a)";
}

export default function ProductCard({ product }: { product: ProductWithRelations }) {
  const primary = product.images[0];
  const secondary = product.images[1];
  const colors = Array.from(
    new Set(product.variants.map((v) => v.color).filter(Boolean) as string[])
  ).slice(0, 5);

  return (
    <Link href={`/productos/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {primary ? (
          <>
            <img
              src={primary.url}
              alt={primary.alt ?? product.name}
              className={`${styles.img} ${styles.imgPrimary}`}
              loading="lazy"
            />
            {secondary && (
              <img
                src={secondary.url}
                alt={secondary.alt ?? product.name}
                className={`${styles.img} ${styles.imgSecondary}`}
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>{product.name.slice(0, 2)}</span>
          </div>
        )}

        <span className={styles.shine} aria-hidden="true" />
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{product.category}</p>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.priceRow}>
          <PriceTag costUSD={product.costUSD} marginPct={product.marginPct} size="sm" />
        </div>

        {colors.length > 0 && (
          <div className={styles.swatches} aria-label={`${colors.length} colores`}>
            {colors.map((c) => (
              <span
                key={c}
                className={styles.swatch}
                style={{ background: colorSwatch(c) }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
