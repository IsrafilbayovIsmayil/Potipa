"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartLine { key: string; productId: string; qty: number; flavour?: string; inscription?: string }
interface Ctx {
  lines: CartLine[]; count: number; ready: boolean;
  add: (l: Omit<CartLine, "key">) => void; setQty: (key: string, qty: number) => void; remove: (key: string) => void; clear: () => void;
}
const C = createContext<Ctx>(null as never);
export const useCart = () => useContext(C);
const KEY = "potipa-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setLines(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {} }, [lines, ready]);

  const value = useMemo<Ctx>(() => ({
    lines, ready, count: lines.reduce((n, l) => n + l.qty, 0),
    add: (l) => setLines((cur) => {
      const key = [l.productId, l.flavour ?? "", l.inscription ?? ""].join("|");
      const f = cur.find((x) => x.key === key);
      return f ? cur.map((x) => (x.key === key ? { ...x, qty: Math.min(50, x.qty + l.qty) } : x)) : [...cur, { ...l, key }];
    }),
    setQty: (key, qty) => setLines((cur) => cur.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(50, qty)) } : x))),
    remove: (key) => setLines((cur) => cur.filter((x) => x.key !== key)),
    clear: () => setLines([]),
  }), [lines, ready]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
