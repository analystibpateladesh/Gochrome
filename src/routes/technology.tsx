import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";
import tech from "@/assets/chrome-exploded.png";

export const Route = createFileRoute("/technology")({
  head: () => ({ meta: [{ title: "Technology — GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Technology" title="Engineered to Sound Better" sub="Chrome Earphones are designed to deliver clear, balanced sound and lasting comfort for everyday use." />
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="relative glow-stage flex items-center justify-center">
          <img src={tech} alt="Chrome Earphones exploded internals" className="w-full object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.4)]" />
        </div>
      </section>
      <Prose>
        <p>Premium Chrome Finish: The outer housing features a polished chrome finish that gives the earphones their distinctive mirror-like appearance. The sleek metallic design adds a premium look while maintaining everyday durability.</p>
        <p>Comfortable Open-Ear Design: The classic earbud shape sits comfortably in your ears and is ideal for long listening sessions. Lightweight construction ensures a secure and natural fit.</p>
        <p>Durable Construction: Reinforced cables and sturdy connectors are built to handle daily use. From your commute to your workspace, Chrome earphones are made to perform reliably.</p>
        <p>Built for Everyday Listening: Designed for smartphones, tablets, and laptops, Chrome earphones deliver excellent sound quality and dependable performance wherever you go.</p>
      </Prose>
    </>
  ),
});
