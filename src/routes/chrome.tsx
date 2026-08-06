import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { featured } from "@/lib/products";
import { PageHeader } from "@/components/PageHeader";
import { ReviewsSection } from "@/components/ReviewsSection";
import { AlertTriangle, ArrowRight, Check, Plus, Star, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import single from "@/assets/chrome-3rd.png";
import jack from "@/assets/2.png";
import lifestyle from "@/assets/micro.png";
import a from "@/assets/3.png";
import b from "@/assets/4.png";
import d from "@/assets/real_shots.png";
import c from "@/assets/5.jpg";
import video from "@/assets/chrome_video.mp4";
import portTypeC from "@/assets/type-c.png";
import portLightning from "@/assets/lightning.png";
import portTypeCLightning from "@/assets/type-c-lightning.png";
import { type ReactNode, useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/chrome")({
  head: () => ({ meta: [{ title: "Shop — GoChrome" }, { name: "description", content: "Browse the GoChrome lineup of premium audio products." }] }),
  component: Shop,
});

const productDetails = [
  {
    q: "Description",
    a: (
      <div className="space-y-4">
        <p>Meet the earbuds that refuse to blend in.</p>
        <p>
          Meet the earphones that were made to stand out. Finished in a stunning mirror-chrome design, GoChrome Chrome Earphones transform a simple everyday accessory into a bold style statement. The highly polished metallic surface reflects light from every angle, creating a futuristic look inspired by modern fashion and technology. But Chrome is more than just good looks.
        </p>
        <p>
          These earphones are engineered to deliver clear vocals, balanced sound, and deep bass, making every song, video, and call sound crisp and immersive. The ergonomic shape sits comfortably in your ears for extended listening, while the lightweight design ensures they feel as good as they look.The durable cable and USB-C connector provide reliable compatibility with most modern smartphones, tablets, and laptops, so you can plug in and enjoy high-quality audio wherever you go.
        </p>
        <p>Whether they're around your neck, in your hand, or plugged in on the go, these earbuds were made to be noticed.</p>
      </div>
    ),
  },
  {
    q: "How's the sound quality?",
    a: "Chrome Earphones deliver clear vocals, deep bass, and balanced sound, making your music, calls, movies, and everyday listening more enjoyable than ever before.",
  },

  {
    q: "Is there a built-in mic?",
    a: "Yes. Chrome Earphones include a built-in microphone for clear calls, voice notes, online classes, and everyday conversations while staying connected.",
  },
  {
    q: "7-Day Return & Refund Policy",
    a:(
      <div className="space-y-4">
        <p>
          Returns and refunds are only available for products that arrive damaged or defective.
          To Know more about our return policy, please visit our <a href="/shipping" className="text-chrome underline">Returns & Refunds</a> page.
        </p>
        <p>The product must also be returned in its original condition with all included accessories and packaging.</p>
      </div>
    ),
  },
];

const portPricing: Record<string, { buyOne: number; buyTwo: number; buyOneMrp: number; buyTwoMrp: number }> = {
  "type-c": { buyOne: 799, buyTwo: 1449, buyOneMrp: 1598, buyTwoMrp: 3196 },
  "lightning": { buyOne: 899, buyTwo: 1649, buyOneMrp: 1763, buyTwoMrp: 3926 },
  "type-c-lightning": { buyOne: 799, buyTwo: 1549, buyOneMrp: 1598, buyTwoMrp: 3361 },
  "jack": { buyOne: 799, buyTwo: 1449, buyOneMrp: 1598, buyTwoMrp: 3019 },
};

// Ports that are available for pre-order only (not in stock yet)
const preorderPorts = ["lightning", "type-c-lightning"];

const portOptions = [
  { value: "type-c", label: "USB Type-C" },
  { value: "lightning", label: "Lightning" },
  { value: "type-c-lightning", label: "Type-C + Lightning" },
];

const portImages: Record<string, string> = {
  "type-c": portTypeC,
  "lightning": portLightning,
  "type-c-lightning": portTypeCLightning,
};

function Shop() {
  const [selectedBundle, setSelectedBundle] = useState("buy1");
  const [selectedImage, setSelectedImage] = useState(0);
  const [openDetail, setOpenDetail] = useState("");
  const [api, setApi] = useState<any>();
  const [selectedPort, setSelectedPort] = useState("type-c");
  const [outOfStockPorts, setOutOfStockPorts] = useState<string[]>(["type-c", "lightning", "type-c-lightning", "jack"]);
  const { add } = useCart();
  const nav = useNavigate();

  const media = [
    { type: "image", src: single },
    { type: "image", src: jack },
    { type: "image", src: lifestyle },
    { type: "image", src: a },
    { type: "image", src: b },
    { type: "image", src: d },
    { type: "image", src: c },
    { type: "video", src: video },
  ];

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedImage(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  const handleThumbnailClick = (idx: number) => {
    if (api) {
      api.scrollTo(idx);
    }
  };

const handlePortChange = (port: string) => {
  setSelectedPort(port);

  if (port === "type-c-lightning") {
    setSelectedBundle("buy2");
  }
};

const pricing = portPricing[selectedPort] ?? portPricing["type-c"];
const buyOnePrice = pricing.buyOne;
const buyTwoPrice = pricing.buyTwo;
const singleProductMrp = pricing.buyOneMrp;
const buyTwoMrp = pricing.buyTwoMrp;
const buyOneSavings = Math.round(((singleProductMrp - buyOnePrice) / singleProductMrp) * 100);
const buyTwoSavings = Math.round(((buyTwoMrp - buyTwoPrice) / buyTwoMrp) * 100);
const selectedQty = selectedBundle === "buy2" ? 2 : 1;
const selectedTotal = selectedBundle === "buy2" ? buyTwoPrice : buyOnePrice;
const selectedUnitPrice = selectedTotal / selectedQty;
const isSoldOutOption = outOfStockPorts.includes(selectedPort);
const isMixedPair = selectedPort === "type-c-lightning";
const isPreorder = preorderPorts.includes(selectedPort);
const displayedPrice = selectedBundle === "buy2" ? buyTwoPrice : buyOnePrice;
const displayedMrp = selectedBundle === "buy2" ? buyTwoMrp : singleProductMrp;
const displayedSavings = selectedBundle === "buy2" ? buyTwoSavings : buyOneSavings;

const portLabel: Record<string, string> = {
  "type-c": "Type-C",
  "lightning": "Lightning",
  "type-c-lightning": "Type-C + Lightning",
};

const selectedItem = {
  id: `${featured.id}-${selectedBundle}-${selectedPort}`,
  name: selectedBundle === "buy2"
    ? `${featured.name} (${portLabel[selectedPort]}) - Buy 2`
    : `${featured.name} (${portLabel[selectedPort]})`,
  price: selectedUnitPrice,
  image: featured.image,
  isSoldOut: isSoldOutOption,
  portType: portLabel[selectedPort],
};

  const handleAddToBag = () => {
    add(selectedItem, selectedQty);
    if (isPreorder) {
      toast.success("Added to Cart — this is a Pre-order item");
    } else {
      toast.success(isSoldOutOption ? "Added to Cart, Please check your cart" : "Added to bag");
    }
  };

  const handleBuyNow = () => {
    add(selectedItem, selectedQty);
    if (isPreorder) {
      toast.success("Added to Order (Pre-order). Proceeding to checkout...");
    } else if (isSoldOutOption) {
      toast.success("Added to Order. Proceeding to checkout...");
    } else {
      toast.success("Added to bag. Proceeding to checkout...");
    }
    nav({ to: "/checkout" });
  };

  return (
    <>
      <PageHeader compact eyebrow="Shop" title="Chrome Earphones" />
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid items-start gap-6 md:grid-cols-2 md:gap-8">
          <div className="min-w-0">
            <div className="relative flex aspect-[0.92] items-center justify-center overflow-hidden bg-background">
              <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {media.map((item, idx) => (
                    <CarouselItem key={idx}>
                      <div className="flex items-center justify-center h-full">
                        {item.type === "image" ? (
                          <img
                            src={item.src}
                            alt={featured.name}
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <video
                            src={item.src}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="h-full w-full object-contain"
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
            <div className="mt-2 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
              {media.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`h-14 w-14 shrink-0 rounded-lg border-2 overflow-hidden transition sm:h-20 sm:w-20 ${
                    selectedImage === idx ? "border-chrome" : "border-border"
                  }`}
                >
                  {item.type === "image" ? (
                    <img src={item.src} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-600">Video</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />)}
              <span className="text-sm text-muted-foreground ml-2">Rated 4.9 (400 Reviews)</span>
            </div>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-6xl">{featured.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">Mirror-finish sound. Molded to move.</p>
            <div className="mt-5 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-bold">₹{displayedPrice.toLocaleString("en-IN")}</span>
              <span className="text-lg text-muted-foreground line-through">₹{displayedMrp.toLocaleString("en-IN")}</span>
              <span className="text-sm font-semibold text-chrome">SAVE {displayedSavings}%</span>
              {isPreorder && (
                <span className="ml-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  PRE-ORDER
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Inclusive of all taxes · Free shipping</p>
            <div className="mt-6">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Select Port Type
              </span>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                {portOptions.map((opt) => {
                  const isSelected = selectedPort === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handlePortChange(opt.value)}
                      aria-pressed={isSelected}
                      className={`relative flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition ${
                        isSelected
                          ? "border-foreground bg-foreground text-background shadow-sm"
                          : "border-border bg-card text-foreground hover:border-foreground/50"
                      }`}
                    >
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {isPreorder && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold">Pre-order</span> only. Your order
                    will be shipped as soon as new stock arrives.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Select Pack Type
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label
                  className={`relative flex cursor-pointer flex-col rounded-2xl border-2 px-5 py-4 transition ${
                    selectedBundle === "buy1"
                      ? "border-foreground bg-secondary/60"
                      : "border-border bg-card hover:border-foreground/40"
                  } ${isMixedPair ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="bundle"
                    value="buy1"
                    checked={selectedBundle === "buy1"}
                    onChange={(e) => setSelectedBundle(e.target.value)}
                    disabled={isMixedPair}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">Buy 1 - Most Popular</span>
                    {selectedBundle === "buy1" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹{buyOnePrice.toLocaleString("en-IN")}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{singleProductMrp.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save {buyOneSavings}%
                  </p>
                </label>

                <label
                  className={`relative flex cursor-pointer flex-col rounded-2xl border-2 px-5 py-4 transition ${
                    selectedBundle === "buy2"
                      ? "border-foreground bg-secondary/60"
                      : "border-border bg-card hover:border-foreground/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="bundle"
                    value="buy2"
                    checked={selectedBundle === "buy2"}
                    onChange={(e) => setSelectedBundle(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">Buy 2 - Save more</span>
                    {selectedBundle === "buy2" && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹{buyTwoPrice.toLocaleString("en-IN")}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{buyTwoMrp.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save {buyTwoSavings}%
                  </p>
                </label>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={handleBuyNow} className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0">
                {isPreorder ? "Pre-order Now" : "Buy Now"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={handleAddToBag} className="flex-1 rounded-full border border-border px-8 py-4 font-semibold transition hover:-translate-y-0.5 hover:bg-accent">
                {isPreorder ? "Add Pre-order to Cart" : "Add to Cart"}
              </button>
            </div>
            <div className="mt-6 border-y border-border">
              {productDetails.map((item) => (
                <ProductDetail
                  key={item.q}
                  title={item.q}
                  open={openDetail === item.q}
                  onToggle={() => setOpenDetail(openDetail === item.q ? "" : item.q)}
                >
                  {item.a}
                </ProductDetail>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <img
          key={selectedPort}
          src={portImages[selectedPort]}
          alt={`${portLabel[selectedPort]} port`}
          className="w-56 sm:w-44 md:w-48 drop-shadow-2xl animate-port-in"
        />
      </div>
      <ReviewsSection compact />
    </>
  );
}

function ProductDetail({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 py-4 text-left">
        <span className="text-sm font-medium">{title}</span>
        {open ? <X className="h-4 w-4 shrink-0" /> : <Plus className="h-5 w-5 shrink-0" />}
      </button>
      {open && <div className="pb-5 pr-4 text-sm leading-7 text-foreground/85">{children}</div>}
    </div>
  );
}