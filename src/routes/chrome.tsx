import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { featured } from "@/lib/products";
import { PageHeader } from "@/components/PageHeader";
import { CheckCircle, Plus, Star, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import single from "@/assets/1.png";
import jack from "@/assets/2.png";
import a from "@/assets/3.png";
import b from "@/assets/4.png";
import c from "@/assets/5.jpg";
import video from "@/assets/chrome_video.mp4";
import { type ReactNode, useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          These earphones are engineered to deliver clear vocals, balanced sound, and deep bass, making every song, video, and call sound crisp and immersive. The ergonomic shape sits comfortably in your ears for extended listening, while the lightweight design ensures they feel as good as they look.The durable cable and  connector provide reliable compatibility with most modern smartphones, tablets, and laptops, so you can plug in and enjoy high-quality audio wherever you go.
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
          Returns and refunds are only available for products that arrive damaged or defective.</p>
        <p>
          To be eligible for a return or refund, you must record a complete unboxing video from the moment the sealed package is opened until the product is fully inspected. Claims submitted without a valid unboxing video will not be accepted under any circumstances, including cases of damaged or defective items.
        </p>
        <p>The product must also be returned in its original condition with all included accessories and packaging.</p>
      </div>
    ),
  },
];

type Color = "silver" | "gold" | "pink";
type Port = "type-c" | "lightning" | "jack";
type Selection = { color: Color; port: Port };

const colors: Array<{ value: Color; label: string; swatch: string; filter: string }> = [
  { value: "silver", label: "Silver", swatch: "#c7cbd1", filter: "none" },
  { value: "gold", label: "Gold", swatch: "#d4a63b", filter: "sepia(0.75) saturate(1.8) hue-rotate(350deg)" },
  { value: "pink", label: "Pink", swatch: "#e8a4b5", filter: "sepia(0.2) saturate(1.9) hue-rotate(295deg)" },
];

const portLabels: Record<Port, string> = { "type-c": "Type-C", lightning: "Lightning", jack: "3.5 mm" };
const basePrice: Record<Color, number> = { silver: 799, gold: 899, pink: 899 };
const silverImages = [single, jack, a, b, c];
const numberedSilverImages = import.meta.glob<string>("@/assets/[0-9]*silver.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
});
const goldImages = import.meta.glob<string>("@/assets/[0-9]*gold.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
});
const pinkImages = import.meta.glob<string>("@/assets/[0-9]*pink.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
});

function getNumberedImages(images: Record<string, string>) {
  return Object.entries(images)
    .sort(([firstPath], [secondPath]) => {
      const firstNumber = Number(firstPath.match(/\/(\d+)(?:silver|gold|pink)\./i)?.[1] ?? 0);
      const secondNumber = Number(secondPath.match(/\/(\d+)(?:silver|gold|pink)\./i)?.[1] ?? 0);
      return firstNumber - secondNumber;
    })
    .map(([, src]) => src);
}

const dedicatedColorImages = {
  silver: getNumberedImages(numberedSilverImages),
  gold: getNumberedImages(goldImages),
  pink: getNumberedImages(pinkImages),
};
const getMediaSources = (color: Color) => {
  if (dedicatedColorImages[color].length > 0) return dedicatedColorImages[color];
  if (color === "silver") return silverImages;

  return [single, jack, a, c];
};

function getUnitPrice(selection: Selection) {
  return selection.color === "silver" && selection.port === "lightning" ? 899 : basePrice[selection.color];
}

function getBundlePrice(selections: Selection[]) {
  if (selections.length === 1) return getUnitPrice(selections[0]);
  return selections.reduce((sum, selection) => sum + getUnitPrice(selection), 0) - 149;
}

function getBundleMrp(selections: Selection[]) {
  return selections.reduce((sum, selection) => sum + basePrice[selection.color], 0);
}

function Shop() {
  const [selectedBundle, setSelectedBundle] = useState("buy2");
  const [selectedImage, setSelectedImage] = useState(0);
  const [openDetail, setOpenDetail] = useState("");
  const [api, setApi] = useState<any>();
  const [selectedColor, setSelectedColor] = useState<Color>("silver");
  const [selectedPort, setSelectedPort] = useState<Port>("type-c");
  const [buyTwoSelections, setBuyTwoSelections] = useState<[Selection, Selection]>([
    { color: "silver", port: "type-c" },
    { color: "silver", port: "type-c" },
  ]);
  const { add } = useCart();
  const nav = useNavigate();

  const selectedColorData = colors.find(color => color.value === selectedColor) ?? colors[0];
  const selectedColorImages = getMediaSources(selectedColor);
  const selectedColorHasDedicatedImages = dedicatedColorImages[selectedColor].length > 0;
  const imageFilter = selectedColorHasDedicatedImages ? "none" : selectedColorData.filter;
  const media = [
    ...selectedColorImages.map(src => ({ type: "image" as const, src, filter: imageFilter })),
    ...(selectedColor === "silver" ? [{ type: "video" as const, src: video }] : []),
  ];
  const buyOneSelection: Selection = { color: selectedColor, port: selectedPort };
  const buyOnePrice = getBundlePrice([buyOneSelection]);
  const buyTwoPrice = getBundlePrice(buyTwoSelections);
  const singleProductMrp = Math.round(buyOnePrice / 0.5);
  const buyTwoMrp = Math.round(buyTwoPrice / 0.45);
  const buyOneSavings = Math.round(((singleProductMrp - buyOnePrice) / singleProductMrp) * 100);
  const buyTwoSavings = Math.round(((buyTwoMrp - buyTwoPrice) / buyTwoMrp) * 100);
  const buyOneSavingsAmount = singleProductMrp - buyOnePrice;
  const buyTwoSavingsAmount = buyTwoMrp - buyTwoPrice;
  const selectedQty = selectedBundle === "buy2" ? 2 : 1;
  const displayedPrice = selectedBundle === "buy2" ? buyTwoPrice : buyOnePrice;
  const displayedMrp = selectedBundle === "buy2" ? buyTwoMrp : singleProductMrp;
  const displayedSavings = selectedBundle === "buy2" ? buyTwoSavings : buyOneSavings;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedImage(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  useEffect(() => {
    if (!api) return;

    api.scrollTo(0);
    setSelectedImage(0);
  }, [api, selectedColor]);

  const handleThumbnailClick = (idx: number) => {
    if (api) {
      api.scrollTo(idx);
    }
  };

  const isSoldOutPort = (port: Port) =>
  port === "jack" || port === "lightning";

  const isSoldOutOption = selectedBundle === "buy2"
    ? buyTwoSelections.some(selection => isSoldOutPort(selection.port))
    : isSoldOutPort(selectedPort);
  const isComingSoon = selectedBundle === "buy2"
    ? buyTwoSelections.some(selection => selection.color !== "silver")
    : selectedColor !== "silver";
  const updateBuyTwo = (index: 0 | 1, key: keyof Selection, value: string) => {
    setBuyTwoSelections(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value, ...(key === "color" && value !== "silver" ? { port: "type-c" } : {}) } : item) as [Selection, Selection]);
  };
  const selectColor = (color: Color) => {
    setSelectedColor(color);
    if (color !== "silver") setSelectedPort("type-c");
    setBuyTwoSelections(current =>
      current.map(selection => ({
        ...selection,
        color,
        ...(color !== "silver" ? { port: "type-c" as const } : {}),
      })) as [Selection, Selection],
    );
  };

const selectedItem = {
  id: `${featured.id}-${selectedBundle}-${selectedColor}-${selectedPort}`,
  name: selectedBundle === "buy2"
    ? `${featured.name}-${buyTwoSelections.map(item => `${item.color}/${item.port}`).join("-")} - Buy 2`
    : `${featured.name}-${selectedColor}/${selectedPort}`,
  price: displayedPrice / selectedQty,
  image: media[0].src,
  isSoldOut: isSoldOutOption,
  portType: selectedBundle === "buy2" ? buyTwoSelections.map(item => portLabels[item.port]).join(" + ") : portLabels[selectedPort],
  color: selectedBundle === "buy2" ? buyTwoSelections.map(item => item.color).join(" + ") : selectedColor,
};

  const handleAddToBag = () => {
    if (isSoldOutOption) return;
    add(selectedItem, selectedQty);
    toast.success("Added to bag");
  };

  const handleBuyNow = () => {
    if (isSoldOutOption || isComingSoon) return;
    add(selectedItem, selectedQty);
    toast.success("Added to bag. Proceeding to checkout...");
    nav({ to: "/checkout" });
  };

  return (
    <>
      <PageHeader eyebrow="Shop" title="Chrome Earphones" compact />
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12 items-start">
          <div className="min-w-0">
            <div className="relative aspect-square flex items-center justify-center bg-background p-3 sm:p-6">
              <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {media.map((item, idx) => (
                    <CarouselItem key={idx} className="aspect-square">
                      <div className="flex h-full w-full items-center justify-center">
                        {item.type === "image" ? (
                          <img
                            src={item.src}
                            alt={featured.name}
                            loading="lazy"
                            className="h-full w-full object-contain"
                            style={{ filter: item.filter }}
                          />
                        ) : (
                          <video
                            src={item.src}
                            controls
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
            <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center">
              {media.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`h-14 w-14 shrink-0 rounded-lg border-2 overflow-hidden transition sm:h-20 sm:w-20 ${
                    selectedImage === idx ? "border-chrome" : "border-border"
                  }`}
                >
                  {item.type === "image" ? (
                    <img src={item.src} alt={`View ${idx + 1}`} className="w-full h-full object-cover" style={{ filter: item.filter }} />
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
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {selectedColorData.label} {featured.name}
            </h1>
            <div className="mt-6 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-bold">₹{displayedPrice.toLocaleString("en-IN")}</span>
              <span className="text-lg text-muted-foreground line-through">₹{displayedMrp.toLocaleString("en-IN")}</span>
              <span className="text-sm font-semibold text-chrome">SAVE {displayedSavings}%</span>
            </div>
            <div className="mt-8">
              <label className="block text-sm font-medium mb-3">Color: {selectedColorData.label}</label>
              <div className="flex gap-2">
                {colors.map(color => {
                  const colorHasDedicatedImages = dedicatedColorImages[color.value].length > 0;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      aria-label={color.label}
                      onClick={() => selectColor(color.value)}
                      className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1 transition ${
                        selectedColor === color.value ? "border-foreground" : "border-border"
                      }`}
                    >
                      <img
                        src={getMediaSources(color.value)[0]}
                        alt={color.label}
                        className="h-full w-full object-contain"
                        style={{ filter: colorHasDedicatedImages ? "none" : color.filter }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <label className={`relative block cursor-pointer rounded-lg border-2 p-5 transition-all ${selectedBundle === "buy1" ? "border-foreground shadow-sm" : "border-border hover:border-foreground/40"}`}>
                <input type="radio" name="bundle" value="buy1" checked={selectedBundle === "buy1"} onChange={(e) => setSelectedBundle(e.target.value)} className="absolute opacity-0" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Buy 1 <span className="ml-2 rounded bg-red-50 px-2 py-1 text-xs font-normal text-red-500">SAVE ₹{buyOneSavingsAmount.toLocaleString("en-IN")}</span></p>
                    <p className="mt-1 text-sm text-muted-foreground">You save {buyOneSavings}%</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold">₹{buyOnePrice.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground line-through">₹{singleProductMrp.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                {selectedBundle === "buy1" && (
                  <div className="mt-5 space-y-3">
                    <p className="text-sm text-foreground">Choose your port type and color</p>
                    <div className="grid min-w-0 grid-cols-[48px_minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3 sm:grid-cols-[48px_116px_174px]">
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-white p-1">
                        <img src={selectedColorImages[0]} alt={`${selectedColor} earphones`} className="h-full w-full object-contain" style={{ filter: imageFilter }} />
                      </div>
                      <Select value={selectedPort} onValueChange={(value) => setSelectedPort(value as Port)}>
                        <SelectTrigger className="h-11 min-w-0 w-[93px] border border-border bg-background shadow-none [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="type-c">Type-C</SelectItem>{selectedColor === "silver" && <><SelectItem value="lightning">Lightning</SelectItem><SelectItem value="jack">3.5 mm</SelectItem></>}</SelectContent>
                      </Select>
                      <Select value={selectedColor} onValueChange={(value) => {
                        setSelectedColor(value as Color);
                        if (value !== "silver") setSelectedPort("type-c");
                      }}>
                        <SelectTrigger className="h-11 min-w-0 w-[93px] rounded-md border border-border bg-background shadow-none [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                        <SelectContent>{colors.map(color => <SelectItem key={color.value} value={color.value}>{color.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </label>
              <label className={`relative block cursor-pointer rounded-lg border-2 p-5 transition-all ${selectedBundle === "buy2" ? "border-foreground shadow-sm" : "border-border hover:border-foreground/40"}`}>
                <input type="radio" name="bundle" value="buy2" checked={selectedBundle === "buy2"} onChange={(e) => setSelectedBundle(e.target.value)} className="absolute opacity-0" />
                <span className="absolute right-5 top-0 -translate-y-1/2 rounded bg-black px-3 py-1 text-xs font-normal text-white">MOST POPULAR</span>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Buy 2 <span className="ml-2 rounded bg-red-50 px-2 py-1 text-xs font-normal text-red-500">SAVE ₹{buyTwoSavingsAmount.toLocaleString("en-IN")}</span></p>
                    <p className="mt-1 text-sm text-muted-foreground">You save {buyTwoSavings}%</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold">₹{buyTwoPrice.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground line-through">₹{buyTwoMrp.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                {selectedBundle === "buy2" && (
                  <div className="mt-5 space-y-3">
                    <p className="text-sm text-foreground">Choose your port type and color</p>
                    {buyTwoSelections.map((selection, index) => (
                      <div key={index} className="grid min-w-0 grid-cols-[48px_minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3 sm:grid-cols-[48px_116px_174px]">
                        <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-white p-1">
                          <img src={getMediaSources(selection.color)[0]} alt={`${selection.color} earphones`} className="h-full w-full object-contain" style={{ filter: dedicatedColorImages[selection.color].length > 0 ? "none" : colors.find(color => color.value === selection.color)?.filter }} />
                        </div>
                        <Select value={selection.port} onValueChange={(value) => updateBuyTwo(index as 0 | 1, "port", value)}>
                          <SelectTrigger className="h-11 min-w-0 w-[93px] border border-border bg-background shadow-none [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="type-c">Type-C</SelectItem>{selection.color === "silver" && <><SelectItem value="lightning">Lightning</SelectItem><SelectItem value="jack">3.5 mm</SelectItem></>}</SelectContent>
                        </Select>
                        <Select value={selection.color} onValueChange={(value) => updateBuyTwo(index as 0 | 1, "color", value)}>
                          <SelectTrigger className="h-11 min-w-0 w-[93px] rounded-md border border-border bg-background shadow-none [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                          <SelectContent>{colors.map(color => <SelectItem key={color.value} value={color.value}>{color.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </label>
            </div>
            {isSoldOutOption && (
              <p className="mt-4 text-sm font-medium text-red-500">
                Out of stock : Lightning and 3.5 mm are currently unavailable.
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={handleBuyNow} disabled={isSoldOutOption || isComingSoon} className="flex-1 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {isComingSoon ? "Coming Soon" : "Buy Now"}
              </button>
 <button onClick={handleAddToBag} disabled={isSoldOutOption} className="flex-1 px-8 py-4 rounded-full border border-border font-semibold hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">
  {"Add to Cart"}
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
