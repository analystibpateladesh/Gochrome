# GoChrome Order Chat Widget — Setup

## 1. Backend (Google Apps Script)

1. Open the Apps Script project attached to your Orders spreadsheet (the same one running your Razorpay/Shiprocket automation).
2. Add `AppsScript-ChatBackend.gs` as a new script file (copy-paste the contents in).
3. At the top, set `CHAT_SHEET_NAME` to your actual sheet tab name, and check the `COL` mapping matches your real header row exactly — **especially `STATUS`**, since your sample data shows a column that might be labelled something like "SANYAM CONFIRM" or similar rather than plain "Status". Rename that constant to match your sheet.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the `/exec` URL it gives you.

## 2. Frontend (React)

1. Copy `ChatWidget.tsx` and `chatConfig.ts` into your storefront, e.g. `src/components/ChatWidget.tsx` and `src/components/chatConfig.ts`.
2. In `chatConfig.ts`, paste your deployed `/exec` URL into `CHAT_BACKEND_URL`.
3. Update `STATUS_TO_STAGE` so the left-hand strings exactly match whatever text actually appears in your Status column (case-sensitive).
4. Fill in the real return policy / support contact text in `FAQ_CONTENT` — pull the wording from your About/Delivery Google Doc.
5. Render it once near the root of your app (e.g. in your root layout / `__root.tsx`):

```tsx
import { ChatWidget } from "@/components/ChatWidget";

export default function RootLayout() {
  return (
    <>
      {/* ...rest of your app... */}
      <ChatWidget />
    </>
  );
}
```

## How it behaves

1. Chat opens → asks for phone number or email.
2. Backend searches the sheet for a match (phone match ignores +91/spaces/dashes).
3. If found, shows a button menu: order status, payment status, order details, FAQ, start over — no free typing needed for the customer.
4. "Where is my order" reads the Status column and replies with the right canned message (confirmed → ships in 1–2 days; dispatched → tracking link coming soon; shipped → 5–6 days + tracking link sent via WhatsApp/email; delivered → confirmed delivered).
5. "Something else / FAQ" shows a second button menu pulled from `FAQ_CONTENT`.

## Notes / next steps

- **Multiple orders per customer**: if a phone/email has more than one order, all are matched and the status reply loops through each — you may want to add an order-picker step if customers commonly have 3+ orders.
- **WhatsApp tracking messages**: this widget doesn't send the WhatsApp tracking message itself — that's still coming from your Shiprocket/courier integration, as today. The bot just tells the customer to expect it.
- **WhatsApp bot version**: same backend (`lookupOrders`) can power a WhatsApp bot later via the WhatsApp Business API (Meta) or a provider like Interakt/AiSensy — the Apps Script endpoint doesn't need to change, only the front-end channel does.
- **Security**: the web app is set to "Anyone" access since the storefront calls it anonymously, but it only _reads_ order data — no write access. Consider adding a lightweight rate limit if you see abuse (e.g. reject if the same IP queries >20 times/minute), which Apps Script can approximate with `CacheService`.
