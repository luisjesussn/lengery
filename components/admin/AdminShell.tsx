"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin-shell.module.css";

type Props = {
  user: { name: string | null; email: string } | null;
  logoutAction: (formData: FormData) => Promise<void>;
  logoutAllAction: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
};

const NAV = [
  { href: "/admin", label: "Productos", exact: true },
  { href: "/admin/productos/nuevo", label: "+ Nuevo producto", exact: false },
  { href: "/admin/settings", label: "Configuración", exact: false },
];

export default function AdminShell({ user, logoutAction, logoutAllAction, children }: Props) {
  const confirmLogoutAll = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("¿Cerrar todas las sesiones en todos los dispositivos?")) {
      e.preventDefault();
    }
  };
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className={styles.shell}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menú"
      >
        <span />
        <span />
        <span />
      </button>

      <aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHead}>
          <Link href="/admin" className={styles.brand}>
            Intima · Admin
          </Link>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>
        <nav className={styles.nav}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.navLink} ${isActive(n.href, n.exact) ? styles.navLinkActive : ""}`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            className={`${styles.navLink} ${styles.navLinkExternal}`}
          >
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
          <form action={logoutAllAction} onSubmit={confirmLogoutAll}>
            <button type="submit" className={styles.logoutAll}>
              Cerrar sesión en todos los dispositivos
            </button>
          </form>
        </div>
      </aside>

      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className={styles.main}>{children}</main>
    </div>
  );
}
