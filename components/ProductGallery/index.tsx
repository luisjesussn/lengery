"use client";

import { useState, useRef, useMemo } from "react";
import type { Image as ImageType } from "@prisma/client";
import styles from "./ProductGallery.module.css";

const COLOR_MAP: Record<string, string> = {
  negro: "#1a1612",
  blanco: "#f5f1ec",
  rojo: "#b8362a",
  rosa: "#e8a8b0",
  rosado: "#e8a8b0",
  burdeos: "#6b1e2c",
  verde: "#5a7a55",
  azul: "#3a5a7a",
  marron: "#6e4a32",
  "marrón": "#6e4a32",
  purpura: "#7c4a86",
  "púrpura": "#7c4a86",
  malva: "#9a7d96",
  beige: "#d4b89a",
  nude: "#e6c9b3",
  gris: "#8c8780",
  amarillo: "#e0b84a",
  naranja: "#d8814a",
  vino: "#5a1a2c",
  oxido: "#a85c3e",
  "óxido": "#a85c3e",
};

function swatchColor(c: string): string {
  return COLOR_MAP[c.toLowerCase()] ?? "linear-gradient(135deg, #d4b89a, #c4756a)";
}

export default function ProductGallery({ images, alt }: { images: ImageType[]; alt: string }) {
  const colors = useMemo(
    () => Array.from(new Set(images.map((i) => i.color).filter(Boolean) as string[])),
    [images]
  );

  const [filter, setFilter] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!filter) return images;
    return images.filter((i) => i.color === filter);
  }, [images, filter]);

  const selectFilter = (c: string | null) => {
    setFilter(c);
    setActive(0);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = mainRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (filtered.length === 0) {
    return <div className={styles.placeholder}>Sin imágenes</div>;
  }

  const current = filtered[active] ?? filtered[0];

  return (
    <div className={styles.wrap}>
      {colors.length > 1 && (
        <div className={styles.colorBar}>
          <button
            className={`${styles.colorChip} ${!filter ? styles.colorChipActive : ""}`}
            onClick={() => selectFilter(null)}
            aria-pressed={!filter}
          >
            <span className={styles.colorAll}>Todos</span>
          </button>
          {colors.map((c) => (
            <button
              key={c}
              className={`${styles.colorChip} ${filter === c ? styles.colorChipActive : ""}`}
              onClick={() => selectFilter(c)}
              aria-pressed={filter === c}
              title={c}
            >
              <span className={styles.colorDot} style={{ background: swatchColor(c) }} />
              <span className={styles.colorName}>{c}</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.gallery}>
        <div className={styles.thumbs}>
          {filtered.map((img, i) => (
            <button
              key={img.id}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Imagen ${i + 1}`}
            >
              <img src={img.url} alt={img.alt ?? alt} loading="lazy" />
            </button>
          ))}
        </div>
        <div
          ref={mainRef}
          className={styles.main}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setZoomPos(null)}
        >
          <img
            src={current.url}
            alt={current.alt ?? alt}
            className={styles.mainImg}
            style={
              zoomPos
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: "scale(1.8)",
                  }
                : undefined
            }
          />
          <span className={`${styles.zoomHint} ${zoomPos ? styles.zoomHintHidden : ""}`}>
            Mové el cursor para zoom
          </span>
        </div>
      </div>
    </div>
  );
}
