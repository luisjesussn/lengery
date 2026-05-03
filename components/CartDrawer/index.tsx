"use client";

import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import { calculateFinalPriceUSD, formatARS, formatUSD } from "@/lib/pricing";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const { items, isOpen, close, remove, setQty, clear, count } = useCart();
  const { currency, blueRate } = useCurrency();

  const fmt = (usd: number) =>
    currency === "USD" ? formatUSD(usd) : formatARS(usd, blueRate);

  const totalUSD = items.reduce(
    (s, it) => s + calculateFinalPriceUSD(it.costUSD, it.marginPct) * it.qty,
    0
  );

  const checkout = () => {
    if (items.length === 0) return;
    const msg = buildWhatsAppMessage(items, currency, blueRate);
    window.open(buildWhatsAppUrl(msg), "_blank", "noopener");
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
          <h3 className={styles.title}>Tu carrito ({count})</h3>
          <button className={styles.iconBtn} onClick={close} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className={styles.body}>
          {items.length === 0 ? (
            <p className={styles.empty}>Tu carrito está vacío.</p>
          ) : (
            <ul className={styles.list}>
              {items.map((it) => {
                const unit = calculateFinalPriceUSD(it.costUSD, it.marginPct);
                const variantLabel = [it.color, it.size].filter(Boolean).join(" / ");
                return (
                  <li key={`${it.productId}-${it.size}-${it.color ?? ""}`} className={styles.item}>
                    <div className={styles.thumb}>
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.name} />
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
              Finalizar por WhatsApp
            </button>
            <button className={styles.clearBtn} onClick={clear}>
              Vaciar carrito
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
