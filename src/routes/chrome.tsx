import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { featured } from "@/lib/products";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/chrome-typec-hero.png";
import white from "@/assets/chrome-typec-single.png";
import jack from "@/assets/chrome-typec.png";

export const Route = createFileRoute("/chrome")({
  head: () => ({
    meta: [
      { title: "Chrome Earphones - GoChrome" },
      { name: "description", content: "Chrome Earphones. Hybrid driver, mirror-polished chrome shell, reference-grade sound." },
      { property: "og:title", content: "Chrome Earphones" },
      { property: "og:image", content: hero },
    ],
  }),
  component: ChromePage,
});

function ChromePage() {
  const nav = useNavigate();

  return (
    <>
      <section className="bg-hero relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Chrome Earphones</p>
          <h1 className="mt-6 text-6xl md:text-8xl font-semibold tracking-tighter">Hear it like<br/><span className="text-chrome">they made it.</span></h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">From Rs. {featured.price.toLocaleString("en-IN")}. Free shipping across India.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={() => nav({ to: "/shop" })} className="px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Buy Now</button>
            <button onClick={() => nav({ to: "/shop" })} className="px-7 py-3.5 rounded-full border border-border text-sm font-medium hover:bg-accent">Add to Bag</button>
          </div>
        </div>
        <div className="relative glow-stage px-6 pb-12">
          <img src={hero} alt="Chrome Earphones" className="relative mx-auto max-w-5xl w-full object-contain animate-float drop-shadow-[0_50px_70px_rgba(0,0,0,0.45)]" width={1920} height={1080} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="relative glow-stage aspect-square flex items-center justify-center">
            <img src={white} alt="Chrome detail" loading="lazy" className="w-[90%] object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]" />
          </div>
          <div className="relative glow-stage aspect-square flex items-center justify-center">
            <img src={jack} alt="Chrome cable and jack" loading="lazy" className="w-[90%] object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-32 text-center">
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">Ready to listen?</h2>
        <p className="mt-4 text-muted-foreground text-lg">Order now. Free shipping.</p>
        <button onClick={() => nav({ to: "/shop" })} className="mt-8 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 inline-flex items-center gap-2">
          Reserve yours <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </>
  );
}
