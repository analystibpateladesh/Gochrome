import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { saveToGoogleSheets } from "@/lib/google-sheets";
import { isRazorpayConfigured, loadRazorpayCheckout, RAZORPAY_KEY_ID, type RazorpayResponse } from "@/lib/razorpay";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout - GoChrome" }] }),
  component: Checkout,
});

type RazorpayOrder = {
  id: string;
  amount: number;
};

function Checkout() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!items.length) {
      toast.error("Your bag is empty.");
      return;
    }

    if (!isRazorpayConfigured()) {
      toast.error("Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID to your environment.");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const customerName = `${data.get("firstName") || ""} ${data.get("lastName") || ""}`.trim();
    const orderId = `GC-${Date.now()}`;

    try {
      await loadRazorpayCheckout();
      const orderResponse = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total * 100,
          receipt: orderId,
          notes: {
            orderId,
            items: items.map((item) => `${item.name} x ${item.qty}`).join(", "),
          },
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Unable to create Razorpay order.");
      }

      const razorpayOrder = (await orderResponse.json()) as RazorpayOrder;

      const paymentHandler = async (response: RazorpayResponse) => {
        const verifyResponse = await fetch("/api/verify-razorpay-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        if (!verifyResponse.ok) {
          setLoading(false);
          toast.error("Payment verification failed. Check RAZORPAY_KEY_SECRET in Vercel.");
          return;
        }

        try {
          await saveToGoogleSheets({
            type: "order",
            orderId,
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
            paymentStatus: "paid",
            customerName,
            email: data.get("email"),
            phone: data.get("phone"),
            streetAddress: data.get("streetAddress"),
            city: data.get("city"),
            state: data.get("state"),
            pinCode: data.get("pinCode"),
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              qty: item.qty,
              price: item.price,
              lineTotal: item.price * item.qty,
            })),
            total,
          });

          clear();
          toast.success("Payment successful. Your order has been placed.");
          nav({ to: "/" });
        } catch (error) {
          console.error(error);
          toast.error("Payment worked, but order was not saved. Check VITE_ORDERS_SHEETS_WEB_APP_URL in Vercel.");
        } finally {
          setLoading(false);
        }
      };

      const checkout = new window.Razorpay!({
        key: RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "GoChrome",
        description: `Order ${orderId}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: customerName,
          email: String(data.get("email") || ""),
          contact: String(data.get("phone") || ""),
        },
        notes: {
          orderId,
          items: items.map((item) => `${item.name} x ${item.qty}`).join(", "),
        },
        theme: {
          color: "#111111",
        },
        handler: paymentHandler,
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      checkout.open();
    } catch {
      setLoading(false);
      toast.error("Razorpay checkout could not be opened. Please try again.");
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-[1fr_400px] gap-12">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-8">Checkout</h1>
        <form onSubmit={submit} className="space-y-8">
          <Section title="Contact">
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone" type="tel" required />
          </Section>
          <Section title="Shipping address">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field name="firstName" label="First name" required />
              <Field name="lastName" label="Last name" required />
            </div>
            <Field name="streetAddress" label="Street address" required />
            <div className="grid sm:grid-cols-3 gap-4">
              <Field name="city" label="City" required />
              <Field name="state" label="State" required />
              <Field name="pinCode" label="PIN code" required />
            </div>
          </Section>
          <Section title="Payment">
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-4">
              <p className="text-sm font-medium">Pay securely with Razorpay</p>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> Cards, UPI, netbanking, and wallets are handled by Razorpay.
              </p>
            </div>
          </Section>
          <button disabled={loading || !items.length} className="w-full px-7 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
            {loading ? "Opening Razorpay..." : `Pay ₹${total.toLocaleString("en-IN")}`}
          </button>
        </form>
      </div>

      <aside className="card-soft p-6 h-fit lg:sticky lg:top-24">
        <h2 className="font-semibold mb-4">Order summary</h2>
        {items.length === 0 ? <p className="text-sm text-muted-foreground">Your bag is empty.</p> : (
          <>
            <div className="space-y-3">
              {items.map(i => (
                <div key={i.id} className="flex gap-3">
                  <img src={i.image} alt={i.name} className="h-14 w-14 rounded-lg object-cover bg-muted" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-muted-foreground">Qty {i.qty}</p>
                  </div>
                  <p className="text-sm">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-5 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              <div className="flex justify-between text-base font-medium pt-2"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </>
        )}
      </aside>
    </section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input {...props} className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
}
