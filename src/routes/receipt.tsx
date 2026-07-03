import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import logo from "@/assets/gochrome-wordmark.png";
import signatureUrl from "@/assets/signature.jpeg";

const REMOTE_LOGO_URL = "https://i.ibb.co/v6GV2zp1/gochromelogo.png";
const REMOTE_SIGNATURE_URL = "https://i.ibb.co/FLzp725j/signature.png";

export const Route = createFileRoute("/receipt")({
  head: () => ({ meta: [{ title: "Order Receipt - GoChrome" }] }),
  component: Receipt,
});

type OrderItem = { id: string; name: string; qty: number; price: number; lineTotal: number };

function Receipt() {
  const [order, setOrder] = useState<any | null>(null);
  const nav = useNavigate();
  const logoSrc = logo || REMOTE_LOGO_URL;
  const signatureSrc = signatureUrl || REMOTE_SIGNATURE_URL;
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("latestOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch (err) {
      console.warn(err);
    }
  }, []);

  useEffect(() => {
    if (!order || !barcodeRef.current) return;

    const loadJsBarcode = async () => {
      try {
        // Load jsbarcode from CDN if not available
        if (!(window as any).JsBarcode) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
          script.onload = () => {
            if ((window as any).JsBarcode && barcodeRef.current) {
              (window as any).JsBarcode(barcodeRef.current, order.orderId, {
                format: "CODE128",
                width: 2,
                height: 50,
                displayValue: true,
              });
            }
          };
          document.head.appendChild(script);
        } else if ((window as any).JsBarcode && barcodeRef.current) {
          (window as any).JsBarcode(barcodeRef.current, order.orderId, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
          });
        }
      } catch (err) {
        console.error("Failed to generate barcode:", err);
      }
    };

    loadJsBarcode();
  }, [order]);

  const printReceipt = () => {
    window.print();
  };

  if (!order) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">No recent order found</h1>
        <p className="mt-4 text-sm text-muted-foreground">If you just paid, please return to the checkout page.</p>
        <div className="mt-6">
          <button onClick={() => nav({ to: "/" })} className="px-4 py-2 rounded bg-primary text-primary-foreground">Go home</button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="flex items-center justify-between">
        <div>
          <img src={logoSrc} alt="GoChrome" className="h-10 w-auto" />
          <div className="text-sm text-muted-foreground">Order receipt</div>
        </div>
        <div className="space-x-2">
          <button onClick={() => { sessionStorage.removeItem("latestOrder"); nav({ to: "/" }); }} className="px-4 py-2 rounded border">Done</button>
          <button onClick={printReceipt} className="px-4 py-2 rounded bg-primary text-primary-foreground">Print / Download Receipt</button>
        </div>
      </div>

      <style>{`
        @media print {
          header, footer { display: none !important; }
          section { padding: 0 !important; }
          button { display: none !important; }
        }
      `}</style>

      <div id="receipt-preview" className="mt-8 card-soft p-6">
        <div className="flex justify-between">
          <div>
            <div className="font-medium">Order ID: {order.orderId}</div>
            <div className="text-sm text-muted-foreground">Razorpay Order ID: {order.razorpayOrderId || "-"}</div>
            <div className="text-sm text-muted-foreground">Payment ID: {order.paymentId || "-"}</div>
            <div className="text-sm text-muted-foreground">{new Date(order.date).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">Gochrome Pvt. Ltd.</div>
            <div className="text-sm text-muted-foreground"> gochrome.in | support@gochrome.in</div>
          </div>
        </div>

        <div className="mt-6">
          <strong>Billing / Shipping</strong>
          <div className="text-sm">{order.customerName} · {order.email} · {order.phone}</div>
          <div className="text-sm">{order.streetAddress} {order.city} {order.state} {order.pinCode}</div>
        </div>

        <table className="w-full mt-4 text-sm">
          <thead>
            <tr className="text-left"><th>Item</th><th>Qty</th><th>Price</th><th>Line total</th></tr>
          </thead>
          <tbody>
            {order.items.map((it: OrderItem) => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td>{it.qty}</td>
                <td>₹{it.price.toLocaleString("en-IN")}</td>
                <td>₹{it.lineTotal.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-right font-medium">Total: ₹{Number(order.total).toLocaleString("en-IN")}</div>

        <div className="mt-6 flex justify-center">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Check Order</div>
            <svg ref={barcodeRef}></svg>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <div className="font-medium">Authorised signatory</div>
            <img src={signatureSrc} alt="Signature" className="h-16 mt-2 object-contain" />
          </div>

          <div className="text-sm text-muted-foreground text-right">
            <div>GoChrome Pvt. Ltd.</div>
            <div>Delhi, India</div>
            <div>gochrome.in | support@gochrome.in | +91 9140579643</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function escapeHtml(s: any) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
