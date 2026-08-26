// ─────────────────────────────────────────────────────────────
// chatConfig.ts
// Edit THIS file whenever wording, timelines, or FAQ answers change.
// No need to touch ChatWidget.tsx for content updates.
// ─────────────────────────────────────────────────────────────

// 1. Point this at your Apps Script Web App URL (same deployment style
//    you already use for checkout / Shiprocket push).
export const CHAT_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzsY710t_SR3LrgUVJzzgchRZx-TJ93weSNmDkj7t9UBfCHfCHqvhty3siQI5SfcCM/exec";

// 2. Map whatever strings appear in your "Status" column to a stage key.
//    Left side = exact text you type into the sheet.
//    Right side = one of the StageKey values below.
export const STATUS_TO_STAGE: Record<string, StageKey> = {
  Empty: "confirmed",
  Packed: "packed",
  Dispatched: "dispatched",
  Shipped: "shipped",
  Delivered: "delivered",
  Stuck: "undelivered",
  Refunded: "cancelled",
};

export type StageKey =
  | "confirmed"
  | "packed"
  | "dispatched"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "undelivered";

// 3. The actual reply text shown for each stage. {orderId} gets replaced.
export const STAGE_MESSAGES: Record<StageKey, { title: string; body: string }> = {
  confirmed: {
    title: "Order Confirmed ✅",
    body: "Your order {orderId} is confirmed and being packed. We'll ship it within 1–2 days. You'll get a dispatch update on WhatsApp & email as soon as it moves.",
  },
  packed: {
    title: "Packed 📦",
    body: "Your order {orderId} has been packed and is ready for dispatch. You'll receive an update on WhatsApp & email once it's on its way.",
  },
  dispatched: {
    title: "Dispatched 📦",
    body: "Your order {orderId} has been dispatched from our warehouse! Your courier partner will share a  pinpoint live tracking link on WhatsApp and email shortly - when your order will get shipped.",
  },
  shipped: {
    title: "On the way 🚚",
    body: "Your order {orderId} is on its way (Shipped) and should arrive in about 5–6 days. You can track it live using the link sent to your WhatsApp & email by our delivery partner.",
  },
  delivered: {
    title: "Delivered 🎧",
    body: "Your order {orderId} was delivered. Hope you're enjoying your Chrome Earphones! If anything's wrong with the product, tap \"Something else\" below to raise a return/replacement request.",
  },
  cancelled: {
    title: "Order Cancelled",
    body: "Order {orderId} shows as cancelled/refunded in our system. If this looks wrong or you'd like help, tap \"Something else\" and we'll get a human to check.",
  },
  undelivered: {
    title: "Checking...",
    body: 'We found order {orderId} but couldn\'t read its current stage. Tap "Something else" and our team will confirm manually.',
  },
};

// 4. FAQ answers — pull the real wording from your About/Delivery Google Doc
//    and paste it in here. Keep answers short; this is a chat bubble, not a page.
export const FAQ_CONTENT: { key: string; label: string; answer: string }[] = [
  {
    key: "delivery_time",
    label: "How long does delivery take?",
    answer:
      "Orders are shipped within 1–2 days of confirmation. Once shipped, delivery typically takes 5–6 days depending on your location. You'll get a tracking link on WhatsApp & email once it's dispatched.",
  },
  {
    key: "about_us",
    label: "About GoChrome",
    answer:
      "GoChrome (gochrome.in) sells Chrome Earphones - wired in-ear earphones with Type-C and Lightning options, 14.2mm drivers, 106±3dB sensitivity, 32Ω impedance, and to deliver a reference-grade listening experience. We ship PAN_INDIA",
  },
  {
    key: "payment_methods",
    label: "Payment & order confirmation",
    answer:
      "Payments are processed securely via Razorpay. You'll receive an email confirmation with your receipt right after a successful payment.",
  },
  {
    key: "contact_human",
    label: "Talk to a human",
    answer:
      "(gochromeaudio@gmail.com / +91 91405 79643) - our team typically replies within a few hours.",
  },
];

// 5. Refund requests — shown as a small, low-emphasis option at the very
//    bottom of the main menu. Sends the customer straight to your shipping/
//    returns page instead of trying to handle refunds inside the chat.
export const REFUND_URL = "https://gochrome.in/shipping";
export const REFUND_MESSAGE =
  "For refund and return requests, please check our shipping & returns policy, I'm opening it for you now.";
