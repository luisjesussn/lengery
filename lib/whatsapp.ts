import { calculateFinalPriceUSD, formatARS, formatUSD } from "./pricing";
import type { Currency } from "./types";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  size: string;
  color: string | null;
  costUSD: number;
  marginPct: number;
  imageUrl: string | null;
  qty: number;
};

export function buildWhatsAppMessage(
  items: CartItem[],
  currency: Currency,
  blueRate: number
): string {
  const lines: string[] = ["Hola! Quiero pedir:", ""];
  let totalUSD = 0;

  items.forEach((it, i) => {
    const unitUSD = calculateFinalPriceUSD(it.costUSD, it.marginPct);
    const lineUSD = unitUSD * it.qty;
    totalUSD += lineUSD;
    const variant = [it.color, it.size].filter(Boolean).join(" / ");
    const price =
      currency === "USD"
        ? formatUSD(lineUSD)
        : `${formatARS(lineUSD, blueRate)} (${formatUSD(lineUSD)})`;
    lines.push(`${i + 1}. ${it.name}${variant ? ` (${variant})` : ""} × ${it.qty} — ${price}`);
  });

  lines.push("");
  const total =
    currency === "USD"
      ? formatUSD(totalUSD)
      : `${formatARS(totalUSD, blueRate)} (${formatUSD(totalUSD)})`;
  lines.push(`Total: ${total}`);

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string, phone?: string): string {
  const target = (phone ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "").replace(/[^\d]/g, "");
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}
