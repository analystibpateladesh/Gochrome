// Spreadsheet ID comes from the Google Sheet URL:
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_THIS_PART/edit
//
// If you want two different spreadsheets, create/deploy this Apps Script twice:
// 1. Contact deployment: paste the Contact sheet ID below.
// 2. Orders deployment: paste the Orders sheet ID below.
// Then put both Web App URLs in your env:
// VITE_CONTACT_SHEETS_WEB_APP_URL=...
// VITE_ORDERS_SHEETS_WEB_APP_URL=...
const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const CONTACT_SHEET_NAME = "Contact Responses";
const ORDERS_SHEET_NAME = "Orders";
const ERROR_SHEET_NAME = "Errors";
// Store the same random value as Vercel's ORDERS_SHEETS_WRITE_TOKEN.
// This prevents unauthenticated callers from inserting fake paid orders.
const ORDERS_WRITE_TOKEN = "PASTE_A_LONG_RANDOM_TOKEN_HERE";

function doGet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    return jsonResponse({
      ok: true,
      spreadsheetName: spreadsheet.getName(),
      message: "GoChrome Apps Script is connected.",
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (data.type === "contact") {
      appendContact(spreadsheet, data);
    } else if (data.type === "order") {
      if (!data.writeToken || data.writeToken !== ORDERS_WRITE_TOKEN) {
        throw new Error("Unauthorized order write");
      }
      appendOrder(spreadsheet, data);
    } else {
      throw new Error("Unknown submission type");
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    logError(error, e);
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function appendContact(spreadsheet, data) {
  const sheet = getSheet(spreadsheet, CONTACT_SHEET_NAME, [
    "Submitted At",
    "Name",
    "Email",
    "Subject",
    "Message",
    "Source",
  ]);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || "",
    data.email || "",
    data.subject || "",
    data.message || "",
    data.source || "",
  ]);
}

function appendOrder(spreadsheet, data) {
  const sheet = spreadsheet.getSheetByName(ORDERS_SHEET_NAME);

  if (!sheet) {
    throw new Error("Orders sheet was not found.");
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const quantity = items.reduce(function (sum, item) {
    return sum + Number(item.qty || 0);
  }, 0);

  const productType = items
    .map(function (item) {
      return item.portType || "";
    })
    .filter(Boolean)
    .join(" + ");

  const source =
    data.source && data.source !== "server-payment-verification"
      ? data.source
      : "https://gochrome.in/checkout";

  const verificationSource =
    data.verificationSource || "server-payment-verification";

  const rowNumber = sheet.getLastRow() + 1;

  // Write only columns A through P. These match the existing Orders sheet.
  sheet.getRange(rowNumber, 1, 1, 16).setValues([[
    data.submittedAt || new Date().toISOString(),
    data.orderId || "",
    data.paymentStatus || "",
    data.customerName || "",
    data.email || "",
    data.phone || "",
    data.streetAddress || "",
    data.city || "",
    data.state || "",
    data.pinCode || "",
    JSON.stringify(items),
    data.total || "",
    data.paymentId || "",
    data.razorpayOrderId || "",
    data.productType || productType,
    source,
  ]]);

  // Column T only. Columns Q-S and U onward remain untouched.
  sheet.getRange(rowNumber, 20).setValue(verificationSource);
}

function getSheet(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function logError(error, e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getSheet(spreadsheet, ERROR_SHEET_NAME, [
      "Time",
      "Error",
      "Payload",
    ]);

    sheet.appendRow([
      new Date().toISOString(),
      String(error),
      e && e.postData ? e.postData.contents : "",
    ]);
  } catch (_) {}
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
