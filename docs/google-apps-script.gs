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
  const sheet = getSheet(spreadsheet, ORDERS_SHEET_NAME, [
    "Submitted At",
    "Order ID",
    "Razorpay Order ID",
    "Payment ID",
    "Payment Status",
    "Customer Name",
    "Email",
    "Phone",
    "Street Address",
    "City",
    "State",
    "PIN Code",
    "Items",
    "Total",
    "Source",
  ]);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.orderId || "",
    data.razorpayOrderId || "",
    data.paymentId || "",
    data.paymentStatus || "",
    data.customerName || "",
    data.email || "",
    data.phone || "",
    data.streetAddress || "",
    data.city || "",
    data.state || "",
    data.pinCode || "",
    JSON.stringify(data.items || []),
    data.total || "",
    data.source || "",
  ]);
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
    const sheet = getSheet(spreadsheet, ERROR_SHEET_NAME, ["Time", "Error", "Payload"]);

    sheet.appendRow([
      new Date().toISOString(),
      String(error),
      e && e.postData ? e.postData.contents : "",
    ]);
  } catch (_) {}
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
