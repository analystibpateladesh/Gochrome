import { priceOrder } from "./_order-pricing.js";
import { verifyPayment } from "./_razorpay.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, customer, items } =
      body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ error: "Missing payment or order fields." });
    }

    const priced = priceOrder(items);
    const { order, payment } = await verifyPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (order.receipt !== orderId || order.amount !== priced.total * 100) {
      return res.status(400).json({ error: "The paid order does not match the checkout order." });
    }

    const sheetUrl =
      process.env.ORDERS_SHEETS_WEB_APP_URL || process.env.VITE_ORDERS_SHEETS_WEB_APP_URL;
    if (!sheetUrl) throw new Error("Orders sheet URL is not configured on the server.");
    const writeToken = process.env.ORDERS_SHEETS_WRITE_TOKEN;
    if (!writeToken) throw new Error("Orders sheet write token is not configured on the server.");

    const record = {
      type: "order",
      orderId,
      razorpayOrderId: order.id,
      paymentId: payment.id,
      paymentStatus: "paid",
      customerName: customer?.customerName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      streetAddress: customer?.streetAddress || "",
      city: customer?.city || "",
      state: customer?.state || "",
      pinCode: customer?.pinCode || "",
      items: priced.items,
      total: priced.total,
      submittedAt: new Date().toISOString(),
      source: "https://gochrome.in/checkout",
      verificationSource: "server-payment-verification",
      writeToken,
    };

    const sheetResponse = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(record),
    });
    const sheetBody = await sheetResponse.text();
    let sheetResult = null;
    try {
      sheetResult = JSON.parse(sheetBody);
    } catch (_) {
      // Apps Script should return JSON. Keep a safe diagnostic if it does not.
    }
    if (!sheetResponse.ok || !sheetResult?.ok) {
      const reason = sheetResult?.error || `Apps Script returned HTTP ${sheetResponse.status}.`;
      throw new Error(`Payment verified, but the order could not be recorded: ${reason}`);
    }

    const { writeToken: _writeToken, ...safeRecord } = record;
    return res.status(200).json({ ok: true, record: safeRecord });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || String(error) });
  }
}
