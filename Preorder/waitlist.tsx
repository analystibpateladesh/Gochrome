import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { saveToGoogleSheets } from "@/lib/google-sheets";
import { useState, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/waitlist")({
  head: () => ({ meta: [{ title: "Join Waitlist - GoChrome" }] }),
  component: Waitlist,
});

function Waitlist() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notify, setNotify] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const joinWaitlist = async () => {
    const form = formRef.current;
    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    setLoading(true);
    const data = new FormData(form);
    const customerName = `${data.get("firstName") || ""} ${data.get("lastName") || ""}`.trim();
    const orderId = `GC-WAITLIST-${Date.now()}`;

    try {
      await saveToGoogleSheets({
        type: "waitlist",
        orderId,
        paymentId: "N/A",
        razorpayOrderId: "N/A",
        paymentStatus: "waitlist (no payment)",
        customerName,
        email: data.get("email"),
        phone: data.get("phone"),
        notifyWhenBack: notify,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          portType: (item as any).portType ?? "",
          qty: item.qty,
          price: item.price,
          lineTotal: item.price * item.qty,
        })),
        total,
      });

      clear();
      toast.success("You've joined the waitlist! We will notify you once stock is available.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight mb-8">Join Waitlist</h1>
      <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="space-y-8">

        <Section title="Contact">
          <Field name="email" label="Email" type="email" required />
          <Field name="phone" label="Phone" type="tel" required />
        </Section>

        <Section title="Personal Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field name="firstName" label="First name" required />
            <Field name="lastName" label="Last name" required />
          </div>
        </Section>

        <div
          className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/40 cursor-pointer"
          onClick={() => setNotify(n => !n)}
        >
          <input
            type="checkbox"
            id="notify"
            checked={notify}
            onChange={e => setNotify(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary cursor-pointer"
          />
          <label htmlFor="notify" className="text-sm cursor-pointer select-none">
            Notify me when they're back in stock
          </label>
        </div>

        <button
          type="button"
          disabled={loading || !notify}
          onClick={joinWaitlist}
          className="w-full px-7 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Join Waitlist (No Payment)"}
        </button>

      </form>
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
      <input
        {...props}
        className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}