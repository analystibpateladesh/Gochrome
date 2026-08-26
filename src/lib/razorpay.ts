const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

let checkoutScriptPromise: Promise<void> | null = null;

export function isRazorpayConfigured() {
  return Boolean(RAZORPAY_KEY_ID);
}

export function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScriptPromise) return checkoutScriptPromise;

  checkoutScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;

    let timeoutId: NodeJS.Timeout;

    script.onload = () => {
      clearTimeout(timeoutId);
      if (window.Razorpay) {
        console.log("Razorpay script loaded successfully");
        resolve();
      } else {
        reject(new Error("Razorpay script loaded but window.Razorpay is not available."));
      }
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      console.error("Failed to load Razorpay script");
      reject(new Error("Unable to load Razorpay Checkout script."));
    };

    // Add a timeout of 10 seconds
    timeoutId = setTimeout(() => {
      console.error("Razorpay script loading timed out");
      reject(new Error("Razorpay Checkout script loading timed out."));
    }, 10000);

    document.body.appendChild(script);
  });

  return checkoutScriptPromise;
}

export type { RazorpayResponse };
