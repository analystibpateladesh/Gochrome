const PORTS = {
  "type-c": { label: "Type-C", one: 799 },
  jack: { label: "3.5mm / Jack", one: 799 },
  lightning: { label: "Lightning", one: 899 },
};

const BUNDLES = {
  "type-c+type-c": 1449,
  "jack+jack": 1449,
  "jack+type-c": 1449,
  "lightning+lightning": 1649,
  "jack+lightning": 1549,
  "lightning+type-c": 1549,
  "type-c+lightning": 1549,
};

const PRODUCTS = {
  "chrome-classic": { name: "Chrome Classic", price: 799 },
  "chrome-c": { name: "Chrome C", price: 999 },
};

function fail(message) {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
}

function canonicalChromeItem(item) {
  const id = String(item?.id || "");
  const match = /^chrome-pro-buy(1|2)-([a-z+\-]+)$/.exec(id);
  if (!match) return null;

  const [, bundleSize, encodedPorts] = match;
  const ports = encodedPorts.includes("+")
    ? encodedPorts.split("+").filter(Boolean)
    : [encodedPorts];
  const portKey = ports.join("+");
  const qty = Number(item?.qty);

  if (!Number.isInteger(qty) || qty < 1 || qty > 20) fail("Invalid item quantity.");
  if (!ports.length || ports.some((port) => !PORTS[port])) fail("Invalid product variant.");
  if (bundleSize === "2" && qty !== 2) fail("Invalid bundle quantity.");
  if (bundleSize === "1" && ports.length !== 1) fail("Invalid product variant.");
  if (bundleSize === "2" && !BUNDLES[portKey]) fail("Invalid bundle variant.");

  const lineTotal = bundleSize === "2" ? BUNDLES[portKey] : PORTS[ports[0]].one * qty;
  const labels = ports.map((port) => PORTS[port].label);

  return {
    id,
    name: `Chrome Earphones (${labels.join(" + ")})${bundleSize === "2" ? " - Buy 2" : ""}`,
    portType: labels.join(" + "),
    qty,
    price: lineTotal / qty,
    lineTotal,
  };
}

export function priceOrder(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 20)
    fail("Invalid order items.");

  const items = rawItems.map((rawItem) => {
    const chromeItem = canonicalChromeItem(rawItem);
    if (chromeItem) return chromeItem;

    const product = PRODUCTS[String(rawItem?.id || "")];
    const qty = Number(rawItem?.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) fail("Invalid order item.");

    return {
      id: rawItem.id,
      name: product.name,
      portType: "",
      qty,
      price: product.price,
      lineTotal: product.price * qty,
    };
  });

  return { items, total: items.reduce((sum, item) => sum + item.lineTotal, 0) };
}
