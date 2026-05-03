"use client";

import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";
import { useCart } from "@/lib/cart-context";
import styles from "./Header.module.css";

export default function Header() {
  const { currency, setCurrency } = useCurrency();
  const { count, open } = useCart();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          Intima
        </Link>
        <nav className={styles.nav}>
          <Link href="/productos">Catálogo</Link>
          <Link href="/productos?featured=1">Destacados</Link>
        </nav>
        <div className={styles.actions}>
          <button
            className={styles.toggle}
            onClick={() => setCurrency(currency === "USD" ? "ARS" : "USD")}
            aria-label="Cambiar moneda"
          >
            {currency}
          </button>
          <button className={styles.cart} onClick={open} aria-label="Abrir carrito">
            Carrito
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
