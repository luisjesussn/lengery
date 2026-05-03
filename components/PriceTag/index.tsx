"use client";

import { useCurrency } from "@/lib/currency-context";
import { calculateFinalPriceUSD, formatARS, formatUSD } from "@/lib/pricing";
import styles from "./PriceTag.module.css";

type Props = {
  costUSD: number;
  marginPct: number;
  size?: "sm" | "md" | "lg";
};

export default function PriceTag({ costUSD, marginPct, size = "md" }: Props) {
  const { currency, blueRate } = useCurrency();
  const finalUSD = calculateFinalPriceUSD(costUSD, marginPct);
  const display = currency === "USD" ? formatUSD(finalUSD) : formatARS(finalUSD, blueRate);

  return <span className={`${styles.price} ${styles[size]}`}>{display}</span>;
}
