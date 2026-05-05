"use client";

import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";
import { useCart } from "@/lib/cart-context";
import { useSiteConfig } from "@/lib/site-config-context";
import styles from "./Header.module.css";

export default function Header() {
  const { currency, setCurrency } = useCurrency();
  const { count, open } = useCart();
  const cfg = useSiteConfig();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label={`${cfg.brandName} — inicio`}>
          {cfg.headerLogoUrl ? (
            <Image
              src={cfg.headerLogoUrl}
              alt={cfg.brandName}
              width={160}
              height={48}
              className={styles.logoImg}
              priority
              sizes="(max-width: 720px) 120px, 160px"
            />
          ) : (
            <span className={styles.logoText}>{cfg.brandName}</span>
          )}
        </Link>
        <nav className={styles.nav}>
          {cfg.navLinks.map((link) => (
            <Link key={`${link.label}-${link.href}`} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
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
            {cfg.cartButtonLabel}
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
