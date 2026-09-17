import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Instagram, Mail, MessageCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/payment-failed")({
  head: () => ({ meta: [{ title: "Payment Help - GoChrome" }] }),
  component: PaymentFailed,
});

type FailureDetails = {
  orderId?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  reason?: string;
};

const supportEmail = "gochromeaudio@gmail.com";
const supportPhone = "919140579643";

function PaymentFailed() {
  const [details, setDetails] = useState<FailureDetails>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("paymentFailure");
      if (raw) setDetails(JSON.parse(raw));
    } catch (error) {
      console.warn("Unable to read payment failure details", error);
    }
  }, []);

  const whatsappMessage = encodeURIComponent(
    `Hi GoChrome, I need help with a failed payment${details.orderId ? ` for order ${details.orderId}` : ""}.`,
  );
  const emailSubject = encodeURIComponent("Help with failed GoChrome payment");
  const emailBody = encodeURIComponent(
    `Hi GoChrome,\n\nI need help with a failed payment.${details.orderId ? `\nOrder ID: ${details.orderId}` : ""}${details.razorpayOrderId ? `\nRazorpay Order ID: ${details.razorpayOrderId}` : ""}${details.paymentId ? `\nPayment ID: ${details.paymentId}` : ""}\n\nThanks,`,
  );

  return (
    <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <div className="card-soft overflow-hidden">
        <div className="border-b border-border bg-amber-50 px-6 py-8 text-center dark:bg-amber-950/20 md:px-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <RefreshCw className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">Payment not completed</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Need a hand with your payment?</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            It looks like Razorpay could not complete this payment. Your cart is still saved, so you can safely try again.
          </p>
        </div>

        <div className="space-y-6 px-6 py-8 md:px-10">
          {details.reason && (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
              <span className="font-medium">Razorpay message:</span> {details.reason}
            </div>
          )}

          <div>
            <h2 className="font-semibold">What you can do now</h2>
            <div className="mt-3 space-y-3 text-sm text-muted-foreground">
              <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />Try the payment again, or use another payment method.</p>
              <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />If money was deducted, it will be refunded automatically.</p>
              <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />Send us your order or payment ID and we will help as quickly as possible.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <a href={`https://wa.me/${supportPhone}?text=${whatsappMessage}`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"><MessageCircle className="h-4 w-4" />WhatsApp</a>
            <a href={`https://mail.google.com/${supportEmail}&subject=${emailSubject}&body=${emailBody}`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted"><Mail className="h-4 w-4" />Email us</a>
            <a href="https://www.instagram.com/gochrome.in/" target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted"><Instagram className="h-4 w-4" />Instagram</a>
          </div>

          <div className="flex flex-col justify-center gap-3 border-t border-border pt-6 sm:flex-row">
            <Link to="/checkout" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"><RefreshCw className="h-4 w-4" />Try payment again</Link>
            <Link to="/chrome" className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted"><ArrowLeft className="h-4 w-4" />Continue shopping</Link>
          </div>
          <p className="text-center text-xs text-muted-foreground">Support: {supportEmail} · +91 91405 79643</p>
        </div>
      </div>
    </section>
  );
}
