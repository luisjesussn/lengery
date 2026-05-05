"use client";

import { useCurrency } from "@/lib/currency-context";
import { formatARS, formatUSD } from "@/lib/pricing";
import styles from "./PriceTag.module.css";

type Props = {
  costUSD: number;
  size?: "sm" | "md" | "lg";
};

export default function PriceTag({ costUSD, size = "md" }: Props) {
  const { currency, blueRate } = useCurrency();
  const display = currency === "USD" ? formatUSD(costUSD) : formatARS(costUSD, blueRate);

  return <span className={`${styles.price} ${styles[size]}`}>{display}</span>;
}
