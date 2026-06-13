import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag — GoChrome" }] }),
  component: Cart,
});

function Cart() {
  const { items, setQty, remove, total } = useCart();

  if (!items.length) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Your bag is empty</h1>
        <p className="mt-3 text-muted-foreground">Discover the lineup.</p>
        <Link to="/shop" className="mt-8 inline-block px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">Shop GoChrome</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-10">Your Bag</h1>
      <div className="space-y-4">
        {items.map(i => (
          <div key={i.id} className="flex gap-5 card-soft p-4">
            <img src={i.image} alt={i.name} className="h-24 w-24 rounded-xl object-cover bg-muted" />
            <div className="flex-1">
              <p className="font-medium">{i.name}</p>
              <p className="text-sm text-muted-foreground">₹{i.price.toLocaleString("en-IN")}</p>
              <div className="mt-3 inline-flex items-center border border-border rounded-full">
                <button onClick={() => setQty(i.id, i.qty - 1)} className="h-8 w-8 grid place-items-center"><Minus className="h-3 w-3" /></button>
                <span className="w-8 text-center text-sm">{i.qty}</span>
                <button onClick={() => setQty(i.id, i.qty + 1)} className="h-8 w-8 grid place-items-center"><Plus className="h-3 w-3" /></button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
              <button onClick={() => remove(i.id)} className="mt-2 text-muted-foreground hover:text-destructive text-xs inline-flex items-center gap-1"><Trash2 className="h-3 w-3" />Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 card-soft p-6">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span></div>
        <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
        <div className="flex justify-between text-lg font-medium mt-4 pt-4 border-t border-border"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
        {/*<Link to="/checkout" className="mt-6 block text-center px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90">Checkout</Link>*/}
      </div>
    </section>
  );
}
