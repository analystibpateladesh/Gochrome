const PORTS = {
  "type-c": { label: "Type-C" },
  jack: { label: "3.5mm / Jack" },
  lightning: { label: "Lightning" },
};

const PRODUCTS = {
  "chrome-classic": { name: "Chrome Classic", price: 799 },
  "chrome-c": { name: "Chrome C", price: 999 },
};

const COLORS = {
  silver: "Silver",
  gold: "Gold",
  pink: "Pink",
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

  const [, bundleSize, encodedVariants] = match;
  const qty = Number(item?.qty);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) fail("Invalid item quantity.");

  const parseVariants = (value) => value.split("+").map((variant) => {
    const match = /^(silver|gold|pink)-(type-c|jack|lightning)$/.exec(variant);
    return match ? { color: match[1], port: match[2] } : null;
  });
  const encodedSelections = parseVariants(encodedVariants);
  const encodedIsValid = encodedSelections.every(Boolean);

  const rawColors = String(item?.color || "")
    .split("+")
    .map((color) => color.trim().toLowerCase())
    .filter(Boolean);
  const rawPorts = String(item?.portType || "")
    .split("+")
    .map((port) => port.trim().toLowerCase())
    .map((port) => {
      if (port.includes("lightning")) return "lightning";
      if (port.includes("type-c") || port.includes("type c")) return "type-c";
      if (port.includes("jack") || port.includes("3.5")) return "jack";
      return "";
    });
  const metadataSelections = rawColors.length === rawPorts.length
    && rawColors.length > 0
    && rawColors.every((color) => COLORS[color])
    && rawPorts.every((port) => PORTS[port])
    ? rawColors.map((color, index) => ({ color, port: rawPorts[index] }))
    : null;
  const expectedSelectionCount = Number(bundleSize);
  let selections;

  if (encodedIsValid && encodedSelections.length === expectedSelectionCount) {
    selections = encodedSelections;
    if (
      metadataSelections
      && (metadataSelections.length !== selections.length
        || metadataSelections.some((selection, index) =>
          selection.color !== selections[index].color || selection.port !== selections[index].port))
    ) {
      fail("Product variant details do not match.");
    }
  } else if (metadataSelections?.length === expectedSelectionCount) {
    selections = metadataSelections;
  } else {
    fail("Invalid product variant.");
  }

  if (bundleSize === "2" && qty < 2) fail("Invalid bundle quantity.");

  const unitPrices = selections.map(({ color, port }) =>
    color === "silver" && port === "lightning" ? 899 : color === "silver" ? 799 : 899,
  );
  const firstUnitPrice = unitPrices[0];
  const secondUnitPrice = unitPrices[1] || firstUnitPrice;
  const lineTotal = qty === 1
    ? firstUnitPrice
    : firstUnitPrice + secondUnitPrice - 149 + (qty - 2) * firstUnitPrice;
  const labels = selections.map(({ color, port }) => `${COLORS[color]} ${PORTS[port].label}`);
  const portLabels = selections.map(({ port }) => PORTS[port].label);
  const colors = selections.map(({ color }) => COLORS[color]);

  return {
    id,
    name: `Chrome Earphones (${labels.join(" + ")})${bundleSize === "2" ? " - Buy 2" : ""}`,
    color: colors.join(" + "),
    portType: portLabels.join(" + "),
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
      color: "",
      portType: "",
      qty,
      price: product.price,
      lineTotal: product.price * qty,
    };
  });

  return { items, total: items.reduce((sum, item) => sum + item.lineTotal, 0) };
}
