import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { featured } from "@/lib/products";
import { PageHeader } from "@/components/PageHeader";
import { CheckCircle, Plus, Star, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import single from "@/assets/chrome-typec-single.png";
import jack from "@/assets/chrome-typec.png";
import a from "@/assets/chrome-ist.png";
import b from "@/assets/chrome-3rd.png";
import c from "@/assets/chrome-iind.png";
import heart from "@/assets/chrome-heart.png";
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
          Returns and refunds are only available for products that arrive damaged or defective.</p>
        <p>
          To be eligible for a return or refund, you must record a complete unboxing video from the moment the sealed package is opened until the product is fully inspected. Claims submitted without a valid unboxing video will not be accepted under any circumstances, including cases of damaged or defective items.
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

function Shop() {
  const [selectedBundle, setSelectedBundle] = useState("buy1");
  const [selectedImage, setSelectedImage] = useState(0);
  const [openDetail, setOpenDetail] = useState("");
  const [api, setApi] = useState<any>();
  const [selectedPort, setSelectedPort] = useState("lightning");
  const [outOfStockPorts, setOutOfStockPorts] = useState<string[]>(["type-c", "lightning", "type-c-lightning", "jack"]);
  const { add } = useCart();
  const nav = useNavigate();
  
  const media = [
    { type: "image", src: b },
    { type: "image", src: c },
    { type: "image", src: a },
    { type: "image", src: single },
    { type: "image", src: jack },
    { type: "image", src: heart },
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
    toast.success(isSoldOutOption ? "Added to Cart, Please check your cart." : "Added to bag");
  };
  
  const handleBuyNow = () => {
    add(selectedItem, selectedQty);
    if (isSoldOutOption) {
      toast.success("Added to Cart, Please check your cart. Proceeding to checkout...");
    } else {
      toast.success("Added to bag. Proceeding to checkout...");
    }
    nav({ to: "/checkout" });
  };

  return (
    <>
      <PageHeader eyebrow="Shop" title="Chrome Earphones" />
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12 items-start">
          <div className="min-w-0">
            <div className="relative glow-stage aspect-square flex items-center justify-center bg-background p-3 sm:p-6">
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
                            className="w-[92%] h-[92%] object-contain" 
                          />
                        ) : (
                          <video 
                            src={item.src} 
                            controls 
                            className="w-[92%] h-[92%] object-contain"
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
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">{featured.name}</h1>
            <div className="mt-6 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-bold">₹{displayedPrice.toLocaleString("en-IN")}</span>
              <span className={`text-lg text-muted-foreground line-through ${outOfStockPorts.includes(selectedPort)}`}>₹{displayedMrp.toLocaleString("en-IN")}</span>
              <span className={`text-sm font-semibold text-chrome ${outOfStockPorts.includes(selectedPort)}`}>SAVE {displayedSavings}%</span>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-chrome flex-shrink-0 mt-0.5" />
                <p className="text-sm">Copper Ring Speakers</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-chrome flex-shrink-0 mt-0.5" />
                <p className="text-sm">Premium Chrome Finish</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-chrome flex-shrink-0 mt-0.5" />
                <p className="text-sm">Built for Daily Use</p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">Chrome Earphones</p>
              <p className="text-xs text-yellow-700 mt-1">Limited Edition</p>
            </div>
            <div className="mt-8 space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition" style={{ borderColor: selectedBundle === "buy1" ? "var(--chrome)" : "var(--border)" }}>
                <input type="radio" name="bundle" value="buy1" checked={selectedBundle === "buy1"} onChange={(e) => setSelectedBundle(e.target.value)} disabled={isMixedPair} className="h-4 w-4 disabled:opacity-50" />
                <div className="ml-4 min-w-0 flex-1">
                  <p className="font-semibold">Buy 1 <span className="text-xs text-muted-foreground font-normal ml-2">MOST POPULAR</span></p>
                  <p className="text-sm text-muted-foreground">You save {buyOneSavings}%</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${outOfStockPorts.includes(selectedPort)}`}>₹{buyOnePrice.toLocaleString("en-IN")}</p>
                  <p className={`text-xs text-muted-foreground line-through ${outOfStockPorts.includes(selectedPort)}`}>₹{singleProductMrp.toLocaleString("en-IN")}</p>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition" style={{ borderColor: selectedBundle === "buy2" ? "var(--chrome)" : "var(--border)" }}>
                <input type="radio" name="bundle" value="buy2" checked={selectedBundle === "buy2"} onChange={(e) => setSelectedBundle(e.target.value)} className="h-4 w-4" />
                <div className="ml-4 min-w-0 flex-1">
                  <p className="font-semibold">Buy 2 <span className="text-xs text-muted-foreground font-normal ml-2">BEST DEAL</span></p>
                  <p className="text-sm text-muted-foreground">You save {buyTwoSavings}%</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${outOfStockPorts.includes(selectedPort)}`}>₹{buyTwoPrice.toLocaleString("en-IN")}</p>
                  <p className={`text-xs text-muted-foreground line-through ${outOfStockPorts.includes(selectedPort)}`}>₹{buyTwoMrp.toLocaleString("en-IN")}</p>
                </div>
              </label>
            </div>
            <div className="mt-8">
              <label className="block text-sm font-medium mb-3">Select Port Type</label>
              <Select value={selectedPort} onValueChange={handlePortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a port" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lightning">Lightning</SelectItem>
                  <SelectItem value="type-c-lightning">1 Type-C + 1 Lightning</SelectItem>
                </SelectContent>
              </Select>
              {outOfStockPorts.includes(selectedPort) && (
                
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
                  <p className="text-sm font-medium text-red-900">Next Drop Pre-Orders Live - launching Soon</p>
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={handleBuyNow} className="flex-1 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90">
  {isSoldOutOption ? "Pre-order" : "Buy Now"}
</button>
<button onClick={handleAddToBag} className="flex-1 px-8 py-4 rounded-full border border-border font-semibold hover:bg-accent">
  {isSoldOutOption ? "Add to Cart" : "To Bag"}
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
