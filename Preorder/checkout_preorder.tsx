import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart, type CartItem } from "@/lib/cart";
import { saveToGoogleSheets } from "@/lib/google-sheets";
import {
  isRazorpayConfigured,
  loadRazorpayCheckout,
  RAZORPAY_KEY_ID,
  type RazorpayResponse,
} from "@/lib/razorpay";
import { useState, useRef, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { toast } from "sonner";
import { Lock, MapPin, Minus, Plus, Search, X } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout - GoChrome" }] }),
  component: Checkout,
});

type RazorpayOrder = {
  id: string;
  amount: number;
};

const addPortLabel: Record<string, string> = {
  "type-c": "Type-C",
  jack: "3.5mm / Jack",
  lightning: "Lightning",
};
const addPortPricing: Record<string, number> = {
  "type-c": 799,
  jack: 799,
  lightning: 899,
};
const checkoutBundlePricing: Record<string, number> = {
  "type-c+type-c": 1449,
  "jack+jack": 1449,
  "jack+type-c": 1449,
  "lightning+lightning": 1649,
  "jack+lightning": 1549,
  "lightning+type-c": 1549,
  "type-c+lightning": 1549,
};

type MapLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

type NominatimPlace = {
  display_name: string;
  lat: string;
  lon: string;
};

function Checkout() {
  const { items, total, setQty, remove, replaceItems, add, clear } = useCart();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locatingAddress, setLocatingAddress] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationResults, setLocationResults] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapPinPosition, setMapPinPosition] = useState({ x: 50, y: 50 });
  const [draggingPin, setDraggingPin] = useState(false);
  const [addPort, setAddPort] = useState("type-c");
  const formRef = useRef<HTMLFormElement | null>(null);

  const hasPreOrders = items.some((item) => item.isSoldOut);
  const hasRegularItems = items.some((item) => !item.isSoldOut);

  const setStreetAddress = (address: string) => {
    const streetInput = formRef.current?.elements.namedItem("streetAddress");

    if (streetInput instanceof HTMLInputElement) {
      streetInput.value = address;
      streetInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const normalizePort = (portType = "") => {
    const port = portType.toLowerCase();

    if (port.includes("lightning")) return "lightning";
    if (port.includes("type-c") || port.includes("type c")) return "type-c";
    if (port.includes("jack") || port.includes("3.5")) return "jack";
    return "";
  };

  const toCheckoutBundle = (ports: string[], image: string): CartItem | null => {
    if (ports.length !== 2) return null;

    const sortedPorts = [...ports].sort();
    const bundleKey = `${sortedPorts[0]}+${sortedPorts[1]}`;
    const bundleTotal = checkoutBundlePricing[bundleKey];
    const labels = sortedPorts.map((port) => addPortLabel[port]);

    if (!bundleTotal || labels.some((label) => !label)) return null;

    return {
      id: `chrome-pro-buy2-${bundleKey}`,
      name: `Chrome Earphones (${labels.join(" + ")}) - Buy 2`,
      price: bundleTotal / 2,
      image,
      qty: 2,
      isSoldOut: true,
      portType: labels.join(" + "),
    };
  };

  const toSingleCartItem = (item: CartItem): CartItem => {
    const ports =
      item.portType
        ?.split("+")
        .map((port) => normalizePort(port))
        .filter(Boolean) ?? [];
    const port = ports.includes("type-c")
      ? "type-c"
      : ports[0] || normalizePort(item.portType || item.name) || "type-c";
    const label = addPortLabel[port] || "Type-C";

    return {
      ...item,
      id: `chrome-pro-buy1-${port}`,
      name: `Chrome Earphones (${label})`,
      price: addPortPricing[port] || 799,
      qty: 1,
      portType: label,
    };
  };

  const isChromeItem = (item: CartItem) =>
    item.id.startsWith("chrome-pro") || item.name.includes("Chrome Earphones");

  const getItemPorts = (item: CartItem) => {
    if (item.portType?.includes("+")) {
      return item.portType
        .split("+")
        .map((port) => normalizePort(port))
        .filter(Boolean);
    }

    const port = normalizePort(item.portType || item.name);
    return Array.from({ length: item.qty }, () => port).filter(Boolean);
  };

  const getPrimaryPort = (item: CartItem) => getItemPorts({ ...item, qty: 1 })[0] || "";

  const addChromePortToCart = (portToAdd: string) => {
    const chromeItems = items.filter(
      (item) => item.id.startsWith("chrome-pro") || item.name.includes("Chrome Earphones"),
    );
    const otherItems = items.filter((item) => !chromeItems.includes(item));
    const existingPorts = chromeItems.flatMap(getItemPorts);
    const nextPorts = [...existingPorts, portToAdd];
    const image = chromeItems[0]?.image || items[0]?.image || "";
    const bundleItem = toCheckoutBundle(nextPorts, image);

    if (bundleItem) {
      replaceItems([...otherItems, bundleItem]);
      toast.success(`Updated to Buy 2 pricing for ${bundleItem.portType}`);
      return;
    }

    add({
      id: `chrome-pro-buy1-${portToAdd}`,
      name: `Chrome Earphones (${addPortLabel[portToAdd]})`,
      price: addPortPricing[portToAdd],
      image: items[0]?.image ?? "",
      isSoldOut: true,
      portType: addPortLabel[portToAdd],
    });
    toast.success(`Added ${addPortLabel[portToAdd]} earphones to your bag`);
  };

  const handleItemQtyChange = (item: CartItem, nextQty: number) => {
    if (item.id.includes("buy2") && nextQty <= 1) {
      replaceItems(
        items.map((cartItem) => (cartItem.id === item.id ? toSingleCartItem(item) : cartItem)),
      );
      return;
    }

    if (nextQty > item.qty && isChromeItem(item)) {
      const port = getPrimaryPort(item);

      if (port) {
        addChromePortToCart(port);
        return;
      }
    }

    setQty(item.id, nextQty);
  };

  // Add another port type directly from checkout
  const handleAddAnother = () => {
    addChromePortToCart(addPort);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) throw new Error("Unable to find address for this location.");

    const data = await response.json();
    return String(data.display_name || "");
  };

  const handleSelectLocation = async () => {
    setLocationPickerOpen(true);
    setLocationResults([]);

    if (!navigator.geolocation) {
      toast.error("Location is not supported on this browser.");
      return;
    }

    setLocatingAddress(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const latitude = Number(coords.latitude.toFixed(6));
        const longitude = Number(coords.longitude.toFixed(6));

        try {
          const address = await reverseGeocode(latitude, longitude);
          setSelectedLocation({ address, latitude, longitude });
          setMapPinPosition({ x: 50, y: 50 });
        } catch (error) {
          console.error(error);
          setSelectedLocation({
            address: "Current location",
            latitude,
            longitude,
          });
          toast.error("Map opened, but the address lookup failed. Please search your address.");
        } finally {
          setLocatingAddress(false);
        }
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Please allow location access to use map selection."
            : "Unable to get your location. You can search your address instead.";

        toast.error(message);
        setLocatingAddress(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) return;

    setLocatingAddress(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(locationSearch)}`,
        { headers: { Accept: "application/json" } },
      );

      if (!response.ok) throw new Error("Unable to search address.");

      const results = ((await response.json()) as NominatimPlace[]).map((place) => ({
        address: place.display_name,
        latitude: Number(place.lat),
        longitude: Number(place.lon),
      }));

      setLocationResults(results);
      setSelectedLocation(results[0] ?? null);
      if (results[0]) setMapPinPosition({ x: 50, y: 50 });

      if (!results.length) toast.error("No locations found. Try a more specific address.");
    } catch (error) {
      console.error(error);
      toast.error("Location search failed. Please type the address manually.");
    } finally {
      setLocatingAddress(false);
    }
  };

  const handleUseSelectedLocation = () => {
    if (!selectedLocation) {
      toast.error("Please choose a location first.");
      return;
    }

    setStreetAddress(selectedLocation.address);
    setLocationPickerOpen(false);
    toast.success("Address added to street address.");
  };

  const pickMapPoint = async (clientX: number, clientY: number, element: HTMLDivElement) => {
    if (!selectedLocation) return;

    const rect = element.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    const latitude = Number((selectedLocation.latitude + (50 - y) * 0.0002).toFixed(6));
    const longitude = Number((selectedLocation.longitude + (x - 50) * 0.0002).toFixed(6));

    setMapPinPosition({ x, y });
    setLocatingAddress(true);

    try {
      const address = await reverseGeocode(latitude, longitude);
      setSelectedLocation({ address, latitude, longitude });
      setMapPinPosition({ x: 50, y: 50 });
    } catch (error) {
      console.error(error);
      toast.error("Could not read that pin address. Try another nearby point.");
    } finally {
      setLocatingAddress(false);
    }
  };

  // Join Waitlist (NO payment)
  const joinWaitlist = async () => {
    const form = formRef.current;
    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    if (!items.length) {
      toast.error("Your bag is empty.");
      return;
    }

    setLoading(true);
    const data = new FormData(form);
    const customerName = `${data.get("firstName") || ""} ${data.get("lastName") || ""}`.trim();
    const orderId = `GC-WAITLIST-${Date.now()}`;

    try {
      await saveToGoogleSheets({
        type: "waitlist",
        orderId,
        paymentId: "N/A",
        razorpayOrderId: "N/A",
        paymentStatus: "waitlist (no payment)",
        customerName,
        email: data.get("email"),
        phone: data.get("phone"),
        streetAddress: data.get("streetAddress"),
        city: data.get("city"),
        state: data.get("state"),
        pinCode: data.get("pinCode"),
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          portType: (item as any).portType ?? "",
          qty: item.qty,
          price: item.price,
          lineTotal: item.price * item.qty,
        })),
        total,
      });

      const orderPayload = {
        orderId,
        paymentId: "N/A",
        razorpayOrderId: "N/A",
        paymentStatus: "waitlist (no payment)",
        customerName,
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || ""),
        streetAddress: String(data.get("streetAddress") || ""),
        city: String(data.get("city") || ""),
        state: String(data.get("state") || ""),
        pinCode: String(data.get("pinCode") || ""),
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          portType: (item as any).portType ?? "",
          qty: item.qty,
          price: item.price,
          lineTotal: item.price * item.qty,
        })),
        total,
        date: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem("latestOrder", JSON.stringify(orderPayload));
      } catch (err) {
        console.warn("Unable to persist order to sessionStorage", err);
      }

      clear();
      toast.success("You've joined the waitlist! Download your confirmation below.");
      nav({ to: "/receipt" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-order WITH payment (Razorpay)
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!items.length) {
      toast.error("Your bag is empty.");
      return;
    }

    if (!isRazorpayConfigured()) {
      toast.error("Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID to your environment.");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const customerName = `${data.get("firstName") || ""} ${data.get("lastName") || ""}`.trim();
    const orderId = `GC-PREORDER-${Date.now()}`;

    try {
      await loadRazorpayCheckout();
      const orderResponse = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total * 100,
          receipt: orderId,
          notes: {
            orderId,
            items: items.map((item) => `${item.name} x ${item.qty}`).join(", "),
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        console.error("Razorpay order creation failed:", {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error ||
            "Unable to create Razorpay order. Check Vercel for RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        );
      }

      const razorpayOrder = (await orderResponse.json()) as RazorpayOrder;

      if (!window.Razorpay) {
        setLoading(false);
        throw new Error(
          "Razorpay is not available. Please check your internet connection and try again.",
        );
      }

      const paymentHandler = async (response: RazorpayResponse) => {
        const verifyResponse = await fetch("/api/verify-razorpay-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        if (!verifyResponse.ok) {
          setLoading(false);
          toast.error("Payment verification failed. Check RAZORPAY_KEY_SECRET in Vercel.");
          return;
        }

        try {
          await saveToGoogleSheets({
            type: "preorder",
            orderId,
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
            paymentStatus: "paid",
            customerName,
            email: data.get("email"),
            phone: data.get("phone"),
            streetAddress: data.get("streetAddress"),
            city: data.get("city"),
            state: data.get("state"),
            pinCode: data.get("pinCode"),
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              portType: (item as any).portType ?? "",
              qty: item.qty,
              price: item.price,
              lineTotal: item.price * item.qty,
            })),
            total,
          });

          const orderPayload = {
            orderId,
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
            paymentStatus: "paid",
            customerName,
            email: String(data.get("email") || ""),
            phone: String(data.get("phone") || ""),
            streetAddress: String(data.get("streetAddress") || ""),
            city: String(data.get("city") || ""),
            state: String(data.get("state") || ""),
            pinCode: String(data.get("pinCode") || ""),
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              portType: (item as any).portType ?? "",
              qty: item.qty,
              price: item.price,
              lineTotal: item.price * item.qty,
            })),
            total,
            date: new Date().toISOString(),
          };

          try {
            sessionStorage.setItem("latestOrder", JSON.stringify(orderPayload));
          } catch (err) {
            console.warn("Unable to persist order to sessionStorage", err);
          }

          clear();
          toast.success(
            "Payment successful! You've joined the waitlist. Download your receipt below.",
          );
          nav({ to: "/receipt" });
        } catch (error) {
          console.error(error);
          toast.error(
            "Payment worked, but order was not saved. Check VITE_ORDERS_SHEETS_WEB_APP_URL in Vercel.",
          );
        } finally {
          setLoading(false);
        }
      };

      const checkout = new window.Razorpay!({
        key: RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "GoChrome",
        description: `Pre-order ${orderId}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: customerName,
          email: String(data.get("email") || ""),
          contact: String(data.get("phone") || ""),
        },
        notes: {
          orderId,
          items: items.map((item) => `${item.name} x ${item.qty}`).join(", "),
        },
        theme: {
          color: "#111111",
        },
        handler: paymentHandler,
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      checkout.open();
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Checkout error:", err);
      toast.error(`Checkout error: ${errorMessage}`);
    }
  };

  const demoCheckout = async () => {
    if (!items.length) {
      toast.error("Your bag is empty.");
      return;
    }

    setLoading(true);
    const form = formRef.current;

    if (!form) {
      toast.error("Please fill the form first.");
      setLoading(false);
      return;
    }

    const data = new FormData(form);
    const customerName = `${data.get("firstName") || ""} ${data.get("lastName") || ""}`.trim();
    const orderId = `GC-DEMO-${Date.now()}`;

    try {
      await saveToGoogleSheets({
        type: "order",
        orderId,
        paymentId: `DEMO-${Date.now()}`,
        razorpayOrderId: "DEMO",
        paymentStatus: "paid (demo)",
        customerName,
        email: data.get("email"),
        phone: data.get("phone"),
        streetAddress: data.get("streetAddress"),
        city: data.get("city"),
        state: data.get("state"),
        pinCode: data.get("pinCode"),
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          portType: (item as any).portType ?? "",
          qty: item.qty,
          price: item.price,
          lineTotal: item.price * item.qty,
        })),
        total,
      });

      const orderPayload = {
        orderId,
        paymentId: `DEMO-${Date.now()}`,
        razorpayOrderId: "DEMO",
        paymentStatus: "paid (demo)",
        customerName,
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || ""),
        streetAddress: String(data.get("streetAddress") || ""),
        city: String(data.get("city") || ""),
        state: String(data.get("state") || ""),
        pinCode: String(data.get("pinCode") || ""),
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          portType: (item as any).portType ?? "",
          qty: item.qty,
          price: item.price,
          lineTotal: item.price * item.qty,
        })),
        total,
        date: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem("latestOrder", JSON.stringify(orderPayload));
      } catch (err) {
        console.warn("Unable to persist order to sessionStorage", err);
      }

      clear();
      toast.success("Demo order created. You can download your receipt now.");
      nav({ to: "/receipt" });
    } catch (err) {
      console.error(err);
      toast.error("Demo checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  const selectedMapSrc = selectedLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.longitude - 0.01}%2C${selectedLocation.latitude - 0.01}%2C${selectedLocation.longitude + 0.01}%2C${selectedLocation.latitude + 0.01}&layer=mapnik&marker=${selectedLocation.latitude}%2C${selectedLocation.longitude}`
    : "";

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-[1fr_400px] gap-12">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-8">Pre-order</h1>
          <form ref={formRef} onSubmit={submit} className="space-y-8">
            <Section title="Contact">
              <Field name="email" label="Email" type="email" required />
              <Field name="phone" label="Phone" type="tel" required />
            </Section>
            <Section title="Shipping address">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="firstName" label="First name" required />
                <Field name="lastName" label="Last name" required />
              </div>
              <div>
                <Field name="streetAddress" label="Street address" required />
                <button
                  type="button"
                  onClick={handleSelectLocation}
                  disabled={locatingAddress}
                  className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locatingAddress ? "Getting location..." : "Select location on map"}
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field name="city" label="City" required />
                <Field name="state" label="State" required />
                <Field name="pinCode" label="PIN code" required />
              </div>
            </Section>

            <Section title="Payment">
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-4">
                <p className="text-sm font-medium">Pay securely with Razorpay</p>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Cards, UPI, netbanking, and wallets are handled by
                  Razorpay.
                </p>
              </div>
            </Section>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || !items.length}
                className="w-full px-7 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pre-order (Pay ₹${total.toLocaleString("en-IN")})`}
              </button>
            </div>
          </form>
        </div>

        <aside className="card-soft p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-3">
                    <img
                      src={i.image}
                      alt={i.name}
                      className="h-14 w-14 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{i.name}</p>
                        {i.isSoldOut && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            Pre-order
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex items-center border border-border rounded-full">
                          <button
                            type="button"
                            onClick={() => handleItemQtyChange(i, i.qty - 1)}
                            className="h-7 w-7 grid place-items-center"
                            aria-label={`Decrease ${i.name} quantity`}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs">{i.qty}</span>
                          <button
                            type="button"
                            onClick={() => handleItemQtyChange(i, i.qty + 1)}
                            className="h-7 w-7 grid place-items-center"
                            aria-label={`Increase ${i.name} quantity`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(i.id)}
                          className="text-xs text-muted-foreground hover:text-destructive underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl border border-dashed border-border">
                <p className="text-xs font-medium mb-4">Add one more </p>
                <div className="flex gap-2">
                  <select
                    value={addPort}
                    onChange={(e) => setAddPort(e.target.value)}
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="type-c">USB Type-C (₹799)</option>
                    <option value="lightning">Lightning (₹899)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddAnother}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="border-t border-border mt-5 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-2">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-xs text-amber-600 mt-3 pt-2 border-t border-border">
                  Items are currently on pre-order. You'll be notified when they're dispatched.
                </p>
              </div>
            </>
          )}
        </aside>
      </section>
      {locationPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-2xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">Select location on map</h2>
                <p className="text-xs text-muted-foreground">
                  Use current location or search, then confirm the pinned address.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocationPickerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
                aria-label="Close location picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex gap-2">
                <input
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLocationSearch();
                    }
                  }}
                  placeholder="Search your building, street, or area"
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleLocationSearch}
                  disabled={locatingAddress}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                  aria-label="Search location"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSelectLocation}
                disabled={locatingAddress}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-60"
              >
                {locatingAddress ? "Finding your location..." : "Use my current location"}
              </button>

              <div
                className="relative overflow-hidden rounded-xl border border-border bg-muted"
                onPointerDown={(event) => {
                  if (!selectedLocation) return;

                  setDraggingPin(true);
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const rect = event.currentTarget.getBoundingClientRect();
                  setMapPinPosition({
                    x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
                    y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
                  });
                }}
                onPointerMove={(event) => {
                  if (!draggingPin || !selectedLocation) return;

                  const rect = event.currentTarget.getBoundingClientRect();
                  setMapPinPosition({
                    x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
                    y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
                  });
                }}
                onPointerUp={(event) => {
                  if (!draggingPin || !selectedLocation) return;

                  setDraggingPin(false);
                  void pickMapPoint(event.clientX, event.clientY, event.currentTarget);
                }}
                onPointerCancel={() => setDraggingPin(false)}
              >
                {selectedMapSrc ? (
                  <>
                    <iframe
                      title="Selected delivery location"
                      src={selectedMapSrc}
                      className="h-64 w-full border-0 pointer-events-none"
                      loading="lazy"
                    />
                    <div
                      className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-full cursor-grab place-items-center text-red-600 drop-shadow-xl active:cursor-grabbing"
                      style={{ left: `${mapPinPosition.x}%`, top: `${mapPinPosition.y}%` }}
                      aria-hidden="true"
                    >
                      <MapPin className="h-10 w-10 fill-red-600 stroke-white stroke-[1.5]" />
                    </div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/95 px-3 py-1 text-xs font-medium shadow">
                      Drag or tap the map to move the pin
                    </div>
                  </>
                ) : (
                  <div className="grid h-64 place-items-center px-6 text-center text-sm text-muted-foreground">
                    Search for an address or use current location to place the pin.
                  </div>
                )}
              </div>

              {locationResults.length > 0 && (
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {locationResults.map((location) => (
                    <button
                      key={`${location.latitude}-${location.longitude}`}
                      type="button"
                      onClick={() => setSelectedLocation(location)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-xs leading-5 ${
                        selectedLocation?.address === location.address
                          ? "border-blue-500 bg-blue-50 text-blue-950"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {location.address}
                    </button>
                  ))}
                </div>
              )}

              {selectedLocation && (
                <div className="rounded-xl border border-border bg-muted/50 px-3 py-3">
                  <p className="text-xs font-medium">Pinned address</p>
                  <p className="mt-1 text-sm leading-6">{selectedLocation.address}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleUseSelectedLocation}
                disabled={!selectedLocation}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Confirm address
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
