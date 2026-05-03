import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "../actions";
import styles from "../admin.module.css";

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          Intima · Admin
        </Link>
        <nav className={styles.nav}>
          <Link href="/admin">Productos</Link>
          <Link href="/admin/productos/nuevo">+ Nuevo producto</Link>
          <Link href="/" target="_blank" rel="noopener">
            Ver tienda ↗
          </Link>
        </nav>
        <div className={styles.user}>
          <p className={styles.userName}>{user?.name ?? user?.email}</p>
          <form action={logoutAction}>
            <button type="submit" className={styles.logout}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
