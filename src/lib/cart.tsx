import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  isSoldOut?: boolean;
  portType?: string;
};

// Bundle price when qty hits 2, keyed by portType. Tweak these numbers freely.
// e.g. type-c: 2 units = ₹1,449 flat instead of 2 × ₹799 = ₹1,598
const BUNDLE_PRICE_FOR_TWO: Record<string, number> = {
  "type-c": 1449,
  lightning: 1649,
};

// Computes the line total for a single cart item, applying bundle pricing
// at qty === 2 and above. Any units beyond 2 are charged at the normal
// per-unit price on top of the bundle price for the first two.
export function computeLineTotal(item: Pick<CartItem, "price" | "qty" | "portType">): number {
  const { price, qty, portType } = item;
  const bundlePrice = portType ? BUNDLE_PRICE_FOR_TWO[portType] : undefined;

  if (bundlePrice && qty >= 2) {
    const extraUnits = qty - 2;
    return bundlePrice + extraUnits * price;
  }
  return price * qty;
}

// Per-unit price a customer is effectively paying at their current qty —
// handy for showing "₹724/ea" style messaging under the price.
export function computeEffectiveUnitPrice(
  item: Pick<CartItem, "price" | "qty" | "portType">,
): number {
  if (item.qty <= 0) return item.price;
  return Math.round(computeLineTotal(item) / item.qty);
}

type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  replaceItems: (items: CartItem[]) => void;
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
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const add: Ctx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((p) => p.id === item.id);
      if (ex) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { ...item, qty }];
    });
  };
  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const replaceItems = (nextItems: CartItem[]) => setItems(nextItems);
  const setQty = (id: string, qty: number) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p)));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + computeLineTotal(i), 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartCtx.Provider value={{ items, add, remove, replaceItems, setQty, clear, total, count }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
