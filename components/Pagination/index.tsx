import Link from "next/link";
import styles from "./Pagination.module.css";

type Props = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

function pageList(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < totalPages - 1) out.push("…");
  out.push(totalPages);
  return out;
}

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M15 6l-6 6 6 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Pagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const items = pageList(page, totalPages);

  return (
    <nav className={styles.nav} aria-label="Paginación">
      <p className={styles.label}>
        Página <span className={styles.labelStrong}>{page}</span>
        <span className={styles.labelSep}>/</span>
        <span>{totalPages}</span>
      </p>

      <div className={styles.controls}>
        {prev ? (
          <Link
            href={buildHref(prev)}
            className={`${styles.arrow} ${styles.prev}`}
            aria-label="Página anterior"
          >
            <ChevronLeft />
            <span className={styles.arrowText}>Anterior</span>
          </Link>
        ) : (
          <span
            className={`${styles.arrow} ${styles.prev} ${styles.disabled}`}
            aria-hidden="true"
          >
            <ChevronLeft />
            <span className={styles.arrowText}>Anterior</span>
          </span>
        )}

        <ul className={styles.list}>
          {items.map((it, i) =>
            it === "…" ? (
              <li key={`e-${i}`} className={styles.ellipsis} aria-hidden="true">
                ···
              </li>
            ) : (
              <li key={it}>
                <Link
                  href={buildHref(it)}
                  className={`${styles.page} ${it === page ? styles.active : ""}`}
                  aria-current={it === page ? "page" : undefined}
                >
                  {it}
                </Link>
              </li>
            )
          )}
        </ul>

        {next ? (
          <Link
            href={buildHref(next)}
            className={`${styles.arrow} ${styles.next}`}
            aria-label="Página siguiente"
          >
            <span className={styles.arrowText}>Siguiente</span>
            <ChevronRight />
          </Link>
        ) : (
          <span
            className={`${styles.arrow} ${styles.next} ${styles.disabled}`}
            aria-hidden="true"
          >
            <span className={styles.arrowText}>Siguiente</span>
            <ChevronRight />
          </span>
        )}
      </div>
    </nav>
  );
}
