"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Currency } from "./types";

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  blueRate: number;
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({
  children,
  blueRate,
}: {
  children: ReactNode;
  blueRate: number;
}) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    const saved = localStorage.getItem("intima:currency") as Currency | null;
    if (saved === "USD" || saved === "ARS") setCurrencyState(saved);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("intima:currency", c);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, blueRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
