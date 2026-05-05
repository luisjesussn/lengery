"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import { formatARS, formatUSD } from "@/lib/pricing";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { useSiteConfig } from "@/lib/site-config-context";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const { items, isOpen, close, remove, setQty, clear, count } = useCart();
  const { currency, blueRate } = useCurrency();
  const cfg = useSiteConfig();

  const fmt = (usd: number) =>
    currency === "USD" ? formatUSD(usd) : formatARS(usd, blueRate);

  const totalUSD = items.reduce((s, it) => s + it.costUSD * it.qty, 0);

  const checkout = () => {
    if (items.length === 0) return;
    const msg = buildWhatsAppMessage(items, currency, blueRate);
    window.open(buildWhatsAppUrl(msg, cfg.whatsappPhone), "_blank", "noopener");
  };

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={close}
        aria-hidden={!isOpen}
      />
      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>{cfg.cartTitle} ({count})</h3>
          <button className={styles.iconBtn} onClick={close} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className={styles.body}>
          {items.length === 0 ? (
            <p className={styles.empty}>{cfg.cartEmptyText}</p>
          ) : (
            <ul className={styles.list}>
              {items.map((it) => {
                const unit = it.costUSD;
                const variantLabel = [it.color, it.size].filter(Boolean).join(" / ");
                return (
                  <li key={`${it.productId}-${it.size}-${it.color ?? ""}`} className={styles.item}>
                    <div className={styles.thumb}>
                      {it.imageUrl ? (
                        <Image
                          src={it.imageUrl}
                          alt={it.name}
                          fill
                          sizes="80px"
                        />
                      ) : (
                        <div className={styles.thumbEmpty} />
                      )}
                    </div>
                    <div className={styles.info}>
                      <p className={styles.name}>{it.name}</p>
                      <p className={styles.variant}>{variantLabel}</p>
                      <p className={styles.price}>{fmt(unit * it.qty)}</p>
                      <div className={styles.controls}>
                        <button
                          onClick={() => setQty(it.productId, it.size, it.color, it.qty - 1)}
                          className={styles.qtyBtn}
                          aria-label="Disminuir"
                        >
                          −
                        </button>
                        <span className={styles.qty}>{it.qty}</span>
                        <button
                          onClick={() => setQty(it.productId, it.size, it.color, it.qty + 1)}
                          className={styles.qtyBtn}
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                        <button
                          onClick={() => remove(it.productId, it.size, it.color)}
                          className={styles.removeBtn}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>{fmt(totalUSD)}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={checkout}>
              {cfg.cartCheckoutLabel}
            </button>
            <button className={styles.clearBtn} onClick={clear}>
              {cfg.cartClearLabel}
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
