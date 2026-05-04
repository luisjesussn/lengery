"use client";

import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";
import { useCart } from "@/lib/cart-context";
import styles from "./Header.module.css";

type Props = {
  logoUrl?: string | null;
};

export default function Header({ logoUrl }: Props) {
  const { currency, setCurrency } = useCurrency();
  const { count, open } = useCart();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="Intima — inicio">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Intima"
              width={160}
              height={48}
              className={styles.logoImg}
              priority
              sizes="(max-width: 720px) 120px, 160px"
            />
          ) : (
            <span className={styles.logoText}>Intima</span>
          )}
        </Link>
        <nav className={styles.nav}>
          <Link href="/productos" className={styles.navLink}>Catálogo</Link>
          <Link href="/productos?featured=1" className={styles.navLink}>Destacados</Link>
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
