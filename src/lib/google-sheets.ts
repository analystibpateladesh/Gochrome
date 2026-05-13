const CONTACT_SHEETS_WEB_APP_URL = import.meta.env.VITE_CONTACT_SHEETS_WEB_APP_URL;
const ORDERS_SHEETS_WEB_APP_URL = import.meta.env.VITE_ORDERS_SHEETS_WEB_APP_URL;

type SheetPayload = Record<string, unknown> & {
  type: "contact" | "order";
};

export function isSheetsConfigured() {
  return Boolean(CONTACT_SHEETS_WEB_APP_URL && ORDERS_SHEETS_WEB_APP_URL);
}

export async function saveToGoogleSheets(payload: SheetPayload) {
  const url = payload.type === "contact" ? CONTACT_SHEETS_WEB_APP_URL : ORDERS_SHEETS_WEB_APP_URL;

  if (!url) {
    throw new Error(`${payload.type} Google Sheets web app URL is not configured.`);
  }

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
