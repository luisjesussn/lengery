"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { CartItem } from "./whatsapp";

const STORAGE_KEY = "intima:cart";

type CartCtx = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string, size: string, color: string | null) => void;
  setQty: (productId: string, size: string, color: string | null, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

const sameVariant = (a: CartItem, productId: string, size: string, color: string | null) =>
  a.productId === productId && a.size === size && (a.color ?? null) === color;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) =>
        sameVariant(p, item.productId, item.size, item.color)
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((productId: string, size: string, color: string | null) => {
    setItems((prev) => prev.filter((p) => !sameVariant(p, productId, size, color)));
  }, []);

  const setQty = useCallback(
    (productId: string, size: string, color: string | null, qty: number) => {
      setItems((prev) =>
        prev
          .map((p) => (sameVariant(p, productId, size, color) ? { ...p, qty } : p))
          .filter((p) => p.qty > 0)
      );
    },
    []
  );

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const count = useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, count, isOpen, open, close, toggle, add, remove, setQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
