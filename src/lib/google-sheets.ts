const CONTACT_SHEETS_WEB_APP_URL = import.meta.env.VITE_CONTACT_SHEETS_WEB_APP_URL;
const ORDERS_SHEETS_WEB_APP_URL = import.meta.env.VITE_ORDERS_SHEETS_WEB_APP_URL;
const PREORDER_SHEETS_WEB_APP_URL = import.meta.env.VITE_PREORDER_SHEETS_WEB_APP_URL;
const WAITLIST_SHEETS_WEB_APP_URL = import.meta.env.VITE_WAITLIST_SHEETS_WEB_APP_URL;

type SheetPayload = Record<string, unknown> & {
  type: "contact" | "order" | "preorder" | "waitlist";
};

export function isSheetsConfigured() {
  return Boolean(CONTACT_SHEETS_WEB_APP_URL && ORDERS_SHEETS_WEB_APP_URL);
}

function getSheetUrl(payload: SheetPayload): string {
  switch (payload.type) {
    case "contact":
      if (!CONTACT_SHEETS_WEB_APP_URL)
        throw new Error(
          "Contact Google Sheets URL is not configured. Add VITE_CONTACT_SHEETS_WEB_APP_URL to Vercel.",
        );
      return CONTACT_SHEETS_WEB_APP_URL;

    case "preorder":
      if (!PREORDER_SHEETS_WEB_APP_URL) {
        console.warn("Preorder URL not set, falling back to orders sheet.");
        if (!ORDERS_SHEETS_WEB_APP_URL) throw new Error("Orders sheet URL also not configured.");
        return ORDERS_SHEETS_WEB_APP_URL;
      }
      return PREORDER_SHEETS_WEB_APP_URL;

    case "waitlist":
      if (!WAITLIST_SHEETS_WEB_APP_URL) {
        console.warn("Waitlist URL not set, falling back to orders sheet.");
        if (!ORDERS_SHEETS_WEB_APP_URL) throw new Error("Orders sheet URL also not configured.");
        return ORDERS_SHEETS_WEB_APP_URL;
      }
      return WAITLIST_SHEETS_WEB_APP_URL;

    case "order":
    default:
      if (!ORDERS_SHEETS_WEB_APP_URL)
        throw new Error(
          "Orders Google Sheets URL is not configured. Add VITE_ORDERS_SHEETS_WEB_APP_URL to Vercel.",
        );
      return ORDERS_SHEETS_WEB_APP_URL;
  }
}

export async function saveToGoogleSheets(payload: SheetPayload) {
  const url = getSheetUrl(payload);

  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      ...payload,
      submittedAt: new Date().toISOString(),
      source: window.location.href,
    }),
  });
}
