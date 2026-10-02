import crypto from "node:crypto";

export function razorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay server keys are not configured.");
  return { keyId, keySecret };
}

export function validSignature(orderId, paymentId, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return (
    expected.length === String(signature).length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)))
  );
}

export async function razorpayGet(path, credentials) {
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64")}`,
    },
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error?.description || "Unable to verify payment with Razorpay.");
  return data;
}

export async function verifyPayment({ orderId, paymentId, signature }) {
  const credentials = razorpayCredentials();
  if (!validSignature(orderId, paymentId, signature, credentials.keySecret)) {
    const error = new Error("Invalid payment signature.");
    error.statusCode = 400;
    throw error;
  }

  const [order, payment] = await Promise.all([
    razorpayGet(`orders/${encodeURIComponent(orderId)}`, credentials),
    razorpayGet(`payments/${encodeURIComponent(paymentId)}`, credentials),
  ]);

  if (
    payment.order_id !== order.id ||
    payment.currency !== "INR" ||
    payment.amount !== order.amount
  ) {
    const error = new Error("Payment amount or order does not match the server order.");
    error.statusCode = 400;
    throw error;
  }
  if (payment.status !== "captured" || !["paid", "attempted"].includes(order.status)) {
    const error = new Error("Payment is not captured.");
    error.statusCode = 400;
    throw error;
  }

  return { order, payment };
}
