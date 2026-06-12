import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = { id: string; name: string; price: number; image: string; qty: number; isSoldOut?: boolean };
type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};
const CartCtx = createContext<Ctx>({} as Ctx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const add: Ctx["add"] = (item, qty = 1) => {
    setItems(prev => {
      const ex = prev.find(p => p.id === item.id);
      if (ex) return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + qty } : p);
      return [...prev, { ...item, qty }];
    });
  };
  const remove = (id: string) => setItems(prev => prev.filter(p => p.id !== id));
  const setQty = (id: string, qty: number) => setItems(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, qty) } : p));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <CartCtx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
