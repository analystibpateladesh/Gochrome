import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const Route = createFileRoute("/products/$id")({
  head: ({ params }) => {
    const p = products.find(x => x.id === params.id);
    return { meta: [{ title: `${p?.name ?? "Product"} — GoChrome` }, { name: "description", content: p?.tagline ?? "" }, { property: "og:image", content: p?.image ?? "" }] };
  },
  component: ProductPage,
  notFoundComponent: () => <div className="p-20 text-center">Product not found. <Link to="/shop" className="underline">Shop</Link></div>,
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = products.find(p => p.id === id);
  const { add } = useCart();
  const nav = useNavigate();
  if (!product) return <div className="p-20 text-center">Not found.</div>;

  const buy = (go = false) => {
    add({ id: product.id, name: product.name, price: product.price, image: product.image });
    toast.success("Added to bag");
    if (go) nav({ to: "/checkout" });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-[1.1fr_0.9fr] gap-16 items-start">
      <div>
        <Carousel className="relative">
          <CarouselContent className="flex">
            {product.images.map((src, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-square flex items-center justify-center overflow-hidden rounded-3xl bg-background p-6 shadow-elegant">
                  <img src={src} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-contain" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
        </Carousel>
      </div>
      <div>
        {product.badge && <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.badge}</p>}
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{product.tagline}</p>
        <p className="mt-8 text-3xl font-medium">₹{product.price.toLocaleString("en-IN")}</p>
        <p className="text-sm text-muted-foreground mt-1">Inclusive of all taxes · Free shipping</p>
        <div className="mt-8 flex gap-3 flex-wrap">
          <button onClick={() => buy(true)} className="px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Buy Now</button>
          <button onClick={() => buy(false)} className="px-7 py-3.5 rounded-full border border-border text-sm font-medium hover:bg-accent">Add to Bag</button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
          <div className="border-t border-border pt-3"><p className="text-muted-foreground text-xs uppercase tracking-widest">Driver</p><p className="mt-1">Hybrid 1DD + 2BA</p></div>
          <div className="border-t border-border pt-3"><p className="text-muted-foreground text-xs uppercase tracking-widest">Frequency</p><p className="mt-1">5Hz – 40kHz</p></div>
          <div className="border-t border-border pt-3"><p className="text-muted-foreground text-xs uppercase tracking-widest">Impedance</p><p className="mt-1">16Ω</p></div>
          <div className="border-t border-border pt-3"><p className="text-muted-foreground text-xs uppercase tracking-widest">Cable</p><p className="mt-1">6N OFC, 1.2m</p></div>
        </div>
      </div>
    </section>
  );
}
