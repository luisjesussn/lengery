import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "../admin.module.css";

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { variants: true, images: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const total = products.length;
  const active = products.filter((p) => p.active).length;
  const featured = products.filter((p) => p.featured).length;
  const noImages = products.filter((p) => p._count.images === 0).length;

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Productos</h1>
          <p className={styles.crumb}>{total} en total</p>
        </div>
        <Link href="/admin/productos/nuevo" className={styles.btnPrimary}>
          + Nuevo producto
        </Link>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Activos</p>
          <p className={styles.statValue}>{active}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Destacados</p>
          <p className={styles.statValue}>{featured}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Sin imágenes</p>
          <p className={`${styles.statValue} ${noImages > 0 ? styles.statWarn : ""}`}>{noImages}</p>
        </div>
      </div>

      {total === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No hay productos aún</p>
          <p className={styles.emptyHint}>Creá el primero para empezar.</p>
          <Link href="/admin/productos/nuevo" className={styles.btnPrimary}>
            + Nuevo producto
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Costo USD</th>
                <th>Margen</th>
                <th>Var.</th>
                <th>Img.</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.images[0] ? (
                      <img src={p.images[0].url} alt={p.name} className={styles.thumb} />
                    ) : (
                      <div className={`${styles.thumb} ${styles.thumbEmpty}`} aria-label="sin imagen">
                        ∅
                      </div>
                    )}
                  </td>
                  <td className={styles.tdName}>{p.name}</td>
                  <td className={styles.tdMuted}>{p.category}</td>
                  <td>${p.costUSD.toFixed(2)}</td>
                  <td>{(p.marginPct * 100).toFixed(0)}%</td>
                  <td>{p._count.variants}</td>
                  <td>{p._count.images}</td>
                  <td>
                    {p.active ? (
                      <span className={`${styles.badge} ${styles.badgeOn}`}>Activo</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeOff}`}>Inactivo</span>
                    )}
                    {p.featured && (
                      <span
                        className={`${styles.badge} ${styles.badgeStar}`}
                        style={{ marginLeft: 4 }}
                        title="Destacado"
                      >
                        ★
                      </span>
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/productos/${p.id}`} className={styles.editLink}>
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
