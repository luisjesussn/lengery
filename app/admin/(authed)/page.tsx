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

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Productos ({products.length})</h1>
        <Link href="/admin/productos/nuevo" className={styles.btn}>
          + Nuevo producto
        </Link>
      </header>

      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Costo USD</th>
            <th>Margen</th>
            <th>Variantes</th>
            <th>Imágenes</th>
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
                  <div className={styles.thumb} />
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
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
                  <span className={`${styles.badge} ${styles.badgeStar}`} style={{ marginLeft: 4 }}>
                    ★
                  </span>
                )}
              </td>
              <td>
                <Link href={`/admin/productos/${p.id}`}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
