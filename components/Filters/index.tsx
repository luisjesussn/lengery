"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import styles from "./Filters.module.css";

type Props = {
  categories: string[];
  activeCategory: string | null;
  featuredOnly: boolean;
};

export default function Filters({ categories, activeCategory, featuredOnly }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const sp = new URLSearchParams(params.toString());
      if (value === null) sp.delete(key);
      else sp.set(key, value);
      sp.delete("page");
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [params, pathname, router]
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.group}>
        <h4 className={styles.title}>Categoría</h4>
        <ul className={styles.list}>
          <li>
            <button
              className={`${styles.option} ${!activeCategory ? styles.active : ""}`}
              onClick={() => update("category", null)}
            >
              Todas
            </button>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <button
                className={`${styles.option} ${activeCategory === c ? styles.active : ""}`}
                onClick={() => update("category", c)}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <span className={styles.divider} aria-hidden="true" />

      <div className={styles.group}>
        <h4 className={styles.title}>Filtros</h4>
        <label className={`${styles.toggle} ${featuredOnly ? styles.toggleActive : ""}`}>
          <input
            type="checkbox"
            className={styles.checkInput}
            checked={featuredOnly}
            onChange={(e) => update("featured", e.target.checked ? "1" : null)}
          />
          ★ Destacados
        </label>
      </div>
    </aside>
  );
}
