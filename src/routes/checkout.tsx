import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { saveToGoogleSheets } from "@/lib/google-sheets";
import { isRazorpayConfigured, loadRazorpayCheckout, RAZORPAY_KEY_ID, type RazorpayResponse } from "@/lib/razorpay";
import { useState, useRef, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { toast } from "sonner";
import { Lock, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout - GoChrome" }] }),
  component: Checkout,
});

type RazorpayOrder = {
  id: string;
  amount: number;
};

function Checkout() {
  const { items, total, setQty, clear } = useCart();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const hasPreOrders = items.some(item => item.isSoldOut);
  const hasRegularItems = items.some(item => !item.isSoldOut);

  const preOrderSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!items.length) {
      toast.error("Your bag is empty.");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const customerName = `${data.get("firstName") || ""} ${data.get("lastName") || ""}`.trim();
    const orderId = `GC-PREORDER-${Date.now()}`;

    try {
      await saveToGoogleSheets({
        type: "order",
        orderId,
        orderType: "pre-order",
        paymentId: "N/A",
        razorpayOrderId: "N/A",
        paymentStatus: "not paid",
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
      toast.success("Pre-order confirmed! We'll contact you soon.");
      nav({ to: "/shop" });
    } catch (error) {
      console.error(error);
      toast.error("Pre-order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    if (hasPreOrders && !hasRegularItems) {
      return preOrderSubmit(e);
    }
    
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
        const errorData = await orderResponse.json().catch(() => ({}));
        console.error("Razorpay order creation failed:", {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorData,
        });
        throw new Error(errorData.error || "Unable to create Razorpay order. Check Vercel for RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
      }

      const razorpayOrder = (await orderResponse.json()) as RazorpayOrder;

      // Ensure Razorpay is available
      if (!window.Razorpay) {
        setLoading(false);
        throw new Error("Razorpay is not available. Please check your internet connection and try again.");
      }

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

          // Save order locally for the receipt page and navigate there so user can download/print it
          try {
            const orderPayload = {
              orderId,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
              paymentStatus: "paid",
              customerName,
              email: String(data.get("email") || ""),
              phone: String(data.get("phone") || ""),
              streetAddress: String(data.get("streetAddress") || ""),
              city: String(data.get("city") || ""),
              state: String(data.get("state") || ""),
              pinCode: String(data.get("pinCode") || ""),
              items: items.map((item) => ({ id: item.id, name: item.name, qty: item.qty, price: item.price, lineTotal: item.price * item.qty })),
              total,
              date: new Date().toISOString(),
            };

            try {
              sessionStorage.setItem("latestOrder", JSON.stringify(orderPayload));
            } catch (err) {
              console.warn("Unable to persist order to sessionStorage", err);
            }

            clear();
            toast.success("Payment successful. You can download your receipt now.");
            nav({ to: "/receipt" });
          } catch (err) {
            // fallback: clear cart and go home
            clear();
            toast.success("Payment successful. Your order has been placed.");
            nav({ to: "/" });
          }
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
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Checkout error:", err);
      console.error("Error details:", {
        message: errorMessage,
        razorpayAvailable: !!window.Razorpay,
        keyIdSet: !!RAZORPAY_KEY_ID,
        type: typeof err,
      });
      toast.error(`Checkout error: ${errorMessage}`);
    }
  };

  const formRef = useRef<HTMLFormElement | null>(null);

  const demoCheckout = async () => {
    if (!items.length) {
      toast.error("Your bag is empty.");
      return;
    }

    setLoading(true);
    const form = formRef.current;
    if (!form) {
      toast.error("Please fill the form first.");
      setLoading(false);
      return;
    }

    const data = new FormData(form);
    const customerName = `${data.get("firstName") || ""} ${data.get("lastName") || ""}`.trim();
    const orderId = `GC-DEMO-${Date.now()}`;

    try {
      await saveToGoogleSheets({
        type: "order",
        orderId,
        paymentId: `DEMO-${Date.now()}`,
        razorpayOrderId: "DEMO",
        paymentStatus: "paid (demo)",
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

      const orderPayload = {
        orderId,
        paymentId: `DEMO-${Date.now()}`,
        razorpayOrderId: "DEMO",
        paymentStatus: "paid (demo)",
        customerName,
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || ""),
        streetAddress: String(data.get("streetAddress") || ""),
        city: String(data.get("city") || ""),
        state: String(data.get("state") || ""),
        pinCode: String(data.get("pinCode") || ""),
        items: items.map((item) => ({ id: item.id, name: item.name, qty: item.qty, price: item.price, lineTotal: item.price * item.qty })),
        total,
        date: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem("latestOrder", JSON.stringify(orderPayload));
      } catch (err) {
        console.warn("Unable to persist order to sessionStorage", err);
      }

      clear();
      toast.success("Demo order created. You can download your receipt now.");
      nav({ to: "/receipt" });
    } catch (err) {
      console.error(err);
      toast.error("Demo checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-[1fr_400px] gap-12">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-8">
          {hasPreOrders && !hasRegularItems ? "Pre-order Confirmation" : "Checkout"}
        </h1>
        <form ref={formRef} onSubmit={submit} className="space-y-8">
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
          
          {!hasPreOrders || hasRegularItems ? (
            <Section title="Payment">
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-4">
                <p className="text-sm font-medium">Pay securely with Razorpay</p>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Cards, UPI, netbanking, and wallets are handled by Razorpay.
                </p>
              </div>
            </Section>
          ) : (
            <Section title="Pre-order Status">
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-4">
                <p className="text-sm font-medium text-amber-900">Pre-order Request</p>
                <p className="mt-1 text-xs text-amber-700">
                  No payment required. We'll contact you when items are back in stock.
                </p>
              </div>
            </Section>
          )}
          
          <div className="space-y-3">
            <button 
              disabled={loading || !items.length} 
              className="w-full px-7 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading 
                ? (hasPreOrders && !hasRegularItems ? "Processing pre-order..." : "Processing...")
                : (hasPreOrders && !hasRegularItems 
                    ? `Confirm Pre-order`
                    : `Pay ₹${total.toLocaleString("en-IN")}`
                )
              }
            </button>
          </div>
        </form>
      </div>

      <aside className="card-soft p-6 h-fit lg:sticky lg:top-24">
        <h2 className="font-semibold mb-4">
          {hasPreOrders && !hasRegularItems ? "Pre-order Summary" : "Order summary"}
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
        ) : (
          <>
            <div className="space-y-3">
              {items.map(i => (
                <div key={i.id} className="flex gap-3">
                  <img src={i.image} alt={i.name} className="h-14 w-14 rounded-lg object-cover bg-muted" />
                  <div className="flex-1 text-sm">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{i.name}</p>
                      {i.isSoldOut && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Pre-order</span>}
                    </div>
                    <div className="mt-2 inline-flex items-center border border-border rounded-full">
                      <button
                        type="button"
                        onClick={() => setQty(i.id, i.qty - 1)}
                        className="h-7 w-7 grid place-items-center"
                        aria-label={`Decrease ${i.name} quantity`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs">{i.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(i.id, i.qty + 1)}
                        className="h-7 w-7 grid place-items-center"
                        aria-label={`Increase ${i.name} quantity`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-5 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              <div className="flex justify-between text-base font-medium pt-2">
                <span>{hasPreOrders && !hasRegularItems ? "Pre-order Total" : "Total"}</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              {hasPreOrders && !hasRegularItems && (
                <p className="text-xs text-amber-600 mt-3 pt-2 border-t border-border">Payment status: Not paid (will be charged when item is back in stock)</p>
              )}
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
