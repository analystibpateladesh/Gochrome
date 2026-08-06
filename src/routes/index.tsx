import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Headphones, Sparkles, Shield, Zap, Plus, Minus, CheckCircle, Star } from "lucide-react";
import { useState } from "react";
import hero from "@/assets/chrome-typec-hero.png";
import single from "@/assets/chrome-typec-single.png";
import jack from "@/assets/4.png";
import lifestyle from "@/assets/micro.png";
import a from "@/assets/2.png";
import b from "@/assets/chrome-3rd.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoChrome — Precision Sound. Engineered Chrome." },
      { name: "description", content: "Discover GoChrome Chrome Earphones — reference-grade sound with mirror-polished chrome styling." },
      { property: "og:title", content: "GoChrome — Precision Sound" },
      { property: "og:description", content: "Reference-grade Chrome Earphones." },
      { property: "og:image", content: hero },
    ],
  }),
  component: Home,
});

const reviews = [
  { n: "Meera Nair", t: "Verified buyer · Bengaluru", q: "The chrome finish looks even better in person. I bought them for the design, but the sound has genuinely surprised me too.", r: 5 },
  { n: "Kabir Shah", t: "Verified buyer · Mumbai", q: "The vocals are clear and the bass has enough punch without becoming muddy. I use them every day for calls and music.", r: 4 },
  { n: "Sana Verma", t: "Verified buyer · Hyderabad", q: "They catch the light nicely and feel comfortable on my commute. The cable also feels more solid than I expected.", r: 5 },
  { n: "Vikram Joshi", t: "Verified buyer · Pune", q: "I wanted something simple that works without charging. They sound clean and are easy to use every day.", r: 4 },
];

const faqs = [
  { q: "Is the sound quality good?", a: "Yes. They deliver clear vocals, deep bass, and crisp sound that makes music, movies, and calls feel immersive." },
  { q: "What comes in the box?", a: "You will receive one pair of chrome wired Type-C earphones in premium packaging." },
  { q: "Is Cash on Delivery (COD) available?", a: "No, Cash on Delivery is not available. All orders must be paid online at checkout." },
  { q: "Are they comfortable to wear?", a: "Yes. Their lightweight open-ear design sits naturally in your ears and stays comfortable even during long listening sessions." },
  { q: "What if I receive a damaged product?", a: "Contact us within 48 hours of delivery with photos or videos, and we’ll help resolve the issue quickly." },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6 animate-fade-up">Introducing</p>
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter animate-fade-up" style={{ animationDelay: "0.05s" }}>
            Chrome <span className="text-chrome">Earphones</span>
          </h1>
          {/*<p className="mt-5 text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Reference-grade sound. Polished to perfection.
          </p>
          <p className="mt-2 text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
            FIRST TIME IN INDIA
          </p>**/}

          <div className="mt-10 flex items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <Link to="/chrome" className="px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">Buy Now</Link>
            <Link to="/technology" className="px-7 py-3.5 rounded-full border border-border text-sm font-medium hover:bg-accent transition flex items-center gap-2">
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div>
              <div className="text-4xl md:text-5xl font-semibold tracking-tight text-chrome">103<span className="text-2xl align-top">±3</span>dB</div>
              <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Sensitivity</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-semibold tracking-tight text-chrome">20<span className="text-2xl">–</span>20kHz</div>
              <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Frequency response</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-4xl md:text-5xl font-semibold tracking-tight text-chrome">400</div>
              <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">5★ Reviews</p>
            </div>
          </div>
        </div>

        <div className="relative -mb-16 px-6 pb-0 md:-mb-24 glow-stage">
          <img src={hero} alt="Chrome Earphones" className="relative mx-auto max-w-4xl w-full object-contain animate-float drop-shadow-[0_50px_70px_rgba(0,0,0,0.45)]" width={1920} height={1080} />
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="relative z-10 border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Headphones, l: "Copper Ring", v: "14.2mm speaker" },
            { icon: Zap, l: "Sensitivity", v: "103±3dB" },
            { icon: Shield, l: "Impedance", v: "32±15% Ω" },
            { icon: Sparkles, l: "Chrome Finish", v: "Mirror polished" },
          ].map(({ icon: Icon, l, v }) => (
            <div key={l} className="flex flex-col items-center text-center">
              <Icon className="h-6 w-6 mb-3 text-muted-foreground" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{l}</p>
              <p className="mt-1 font-medium">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ENGINEERING / EXPLODED VIEW
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Inside the chrome</p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mt-3">Engineered, layer by layer.</h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              A 10mm beryllium-coated dynamic driver, twin custom-tuned balanced armatures, and a 3-way passive crossover — assembled inside a CNC-machined chrome shell. Every component placed for sound, then sealed for life.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-semibold text-chrome">3</div>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Driver hybrid</p>
              </div>
              <div>
                <div className="text-3xl font-semibold text-chrome">42</div>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">CNC Steps</p>
              </div>
            </div>
            <Link to="/technology" className="mt-8 inline-flex items-center gap-2 text-sm font-medium hover:underline">Read the engineering story <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative glow-stage">
            <img src={exploded} alt="Chrome Earphones exploded view" loading="lazy" className="relative w-full object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
      </section>
      */}

      {/* FEATURE HIGHLIGHT */}
      <section className="relative overflow-hidden bg-background/10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Built to move</p>
            <h2 className="mt-6 text-5xl md:text-6xl font-semibold tracking-tight">Built to move <span className="text-foreground/80">different.</span></h2>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">Striking design. Powerful sound. Zero compromise.</p>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              { img: a, title: "Own the Look. Hear the Difference.", text: "Choose your Chrome Earphones and enjoy bold design with clear, immersive sound built for music, calls, and everyday listening." },
              { img: single, title: "Discover What Shines Inside.", text: "Open the box to reveal your Chrome Earphones, a polished mirror-chrome design that looks modern, feels premium, and is made to stand out." },
              { img: b, title: "Style Meets Sound.", text: "Chrome Earphones combine a premium mirror finish with clear, balanced audio, giving you an everyday listening experience that looks as good as it sounds." },
            ].map(item => (
              <div key={item.title} className="group transition">
                <div className="aspect-square overflow-hidden">
                  <img src={item.img} alt={item.title} className="h-full w-full object-contain object-center" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STORY — jack & cable */}
      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative glow-stage aspect-square flex items-center justify-center">
            <img src={jack} alt="Chrome earbud with 3.5mm jack and braided cable" loading="lazy" className="w-[92%] object-contain animate-float drop-shadow-[0_40px_50px_rgba(0,0,0,0.4)]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Cable & connector</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-3">Pure signal, head to plug</h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              Mirror-Finish Design. Crafted with a polished chrome exterior that reflects light beautifully and delivers a bold, premium look. Experience crisp vocals, deep bass, and crystal-clear sound that brings your music, movies, and calls to life.Connect through Type-C and enjoy seamless audio with no charging, pairing, or interruptions.

            </p>
            <Link to="/technology" className="mt-8 inline-flex items-center gap-2 text-sm font-medium hover:underline">Explore the Chrome Earphones<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* LIFESTYLE */}
      <section className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">For Everyday Listening</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-3">Sound you can rely on.</h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">Clear vocals, deep bass, and balanced audio designed for music, calls, and everything in between.</p>
          <Link to="/chrome" className="mt-8 inline-block px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">Shop GoChrome</Link>
        </div>
        <div className="order-1 md:order-2">
          <img src={lifestyle} alt="Listener wearing GoChrome earphones" loading="lazy" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* REVIEWS */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Loved by listeners</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">4.9 out of 5</h2>
            <div className="mt-3 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />)}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Based on 400 verified reviews</p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            {reviews.map(r => (
              <figure key={r.n} className="border-b border-border py-4 first:border-t">
                <div className="flex gap-0.5">
                  {Array.from({ length: r.r }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-foreground text-foreground" />)}
                </div>
                <blockquote className="mt-2 text-sm leading-6">"{r.q}"</blockquote>
                <figcaption className="mt-2 text-xs">
                  <span className="font-medium">{r.n}</span>
                  <span className="text-muted-foreground"> · {r.t}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-32">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground text-center">Questions</p>
        <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight text-center">Frequently asked.</h2>
        <div className="mt-14 border-y border-border">
          {faqs.map((f, i) => <Faq key={i} q={f.q} a={f.a} />)}
        </div>
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Still have questions? <Link to="/contact" className="text-foreground underline underline-offset-4">Contact our team</Link>
        </p>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-hero">
        <div className="mx-auto max-w-4xl px-6 py-32 text-center">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">Hear what you've been missing.</h2>
          <p className="mt-4 text-muted-foreground text-lg">Order today. Free shipping.</p>
          <Link to="/chrome" className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90">
            Reserve Chrome Earphones <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border bg-transparent last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="font-medium">{q}</span>
        {open ? <Minus className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
      </button>
      {open && <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}
