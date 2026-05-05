"use client";

import { useState, useMemo } from "react";
import type { ProductWithRelations } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import styles from "./VariantSelector.module.css";

export default function VariantSelector({ product }: { product: ProductWithRelations }) {
  const { variants } = product;
  const { add } = useCart();

  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean) as string[])),
    [variants]
  );
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants]
  );

  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [size, setSize] = useState<string | null>(null);

  const isAvailable = (s: string, c: string | null) =>
    variants.some((v) => v.size === s && (v.color ?? null) === c);

  if (variants.length === 0) return null;

  const handleAdd = () => {
    if (!size) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      size,
      color,
      costUSD: product.costUSD,
      imageUrl: product.images[0]?.url ?? null,
    });
  };

  return (
    <div className={styles.wrap}>
      {colors.length > 0 && (
        <div className={styles.group}>
          <p className={styles.label}>
            Color: <span>{color}</span>
          </p>
          <div className={styles.options}>
            {colors.map((c) => (
              <button
                key={c}
                className={`${styles.chip} ${c === color ? styles.chipActive : ""}`}
                onClick={() => setColor(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.group}>
        <p className={styles.label}>Talle</p>
        <div className={styles.options}>
          {sizes.map((s) => {
            const avail = isAvailable(s, color);
            return (
              <button
                key={s}
                disabled={!avail}
                className={`${styles.chip} ${s === size ? styles.chipActive : ""} ${
                  !avail ? styles.chipDisabled : ""
                }`}
                onClick={() => avail && setSize(s)}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <button className={styles.cta} disabled={!size} onClick={handleAdd}>
        {size ? "Agregar al carrito" : "Elegí un talle"}
      </button>
    </div>
  );
}
