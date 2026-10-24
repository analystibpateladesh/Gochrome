import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = { id: string; name: string; price: number; image: string; qty: number; isSoldOut?: boolean; portType?: string; color?: string };

// Bundle price for non-Chrome items when qty hits 2, keyed by portType.
const BUNDLE_PRICE_FOR_TWO: Record<string, number> = {
  "type-c": 1449,
  "lightning": 1649,
};

type PriceableCartItem = Pick<CartItem, "price" | "qty" | "portType"> &
  Partial<Pick<CartItem, "id" | "name" | "color">>;

function isChromeItem(item: PriceableCartItem) {
  return item.id?.startsWith("chrome-pro") || item.name?.includes("Chrome Earphones");
}

function getChromeUnitPrices(item: PriceableCartItem): number[] {
  const colors = item.color?.split("+").map(color => color.trim().toLowerCase()).filter(Boolean) ?? [];
  const ports = item.portType?.split("+").map(port => port.trim().toLowerCase()).filter(Boolean) ?? [];
  const unitCount = Math.max(colors.length, ports.length, 1);

  return Array.from({ length: unitCount }, (_, index) => {
    const color = colors[index] ?? colors[0];
    const port = ports[index] ?? ports[0] ?? "";

    if (color === "silver" && port.includes("lightning")) return 899;
    if (color === "gold" || color === "pink") return 899;
    if (color === "silver") return 799;
    if (port.includes("lightning")) return 899;
    if (port.includes("type-c") || port.includes("type c")) return 799;
    return item.price;
  });
}

export function computeRegularUnitPrice(item: PriceableCartItem): number {
  return isChromeItem(item) ? getChromeUnitPrices(item)[0] : item.price;
}

// Applies Chrome's ₹149 pair discount to its selected units. Any quantity
// beyond the pair is charged at the first selected unit's regular price.
export function computeLineTotal(item: PriceableCartItem): number {
  const { price, qty, portType } = item;

  if (isChromeItem(item)) {
    const unitPrices = getChromeUnitPrices(item);
    const firstUnitPrice = unitPrices[0];

    if (qty === 1) return firstUnitPrice;
    if (qty >= 2) {
      const secondUnitPrice = unitPrices[1] ?? firstUnitPrice;
      return firstUnitPrice + secondUnitPrice - 149 + (qty - 2) * firstUnitPrice;
    }
    return qty * firstUnitPrice;
  }

  const bundlePrice = portType ? BUNDLE_PRICE_FOR_TWO[portType] : undefined;

  if (bundlePrice && qty >= 2) {
    const extraUnits = qty - 2;
    return bundlePrice + extraUnits * price;
  }
  return price * qty;
}

// Per-unit price a customer is effectively paying at their current qty —
// handy for showing "₹724/ea" style messaging under the price.
export function computeEffectiveUnitPrice(item: PriceableCartItem): number {
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
  const replaceItems = (nextItems: CartItem[]) => setItems(nextItems);
  const setQty = (id: string, qty: number) => setItems(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, qty) } : p));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + computeLineTotal(i), 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <CartCtx.Provider value={{ items, add, remove, replaceItems, setQty, clear, total, count }}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
