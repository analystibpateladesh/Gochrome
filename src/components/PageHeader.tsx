import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-20 pb-12 animate-fade-up">
      {eyebrow && <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">{eyebrow}</p>}
      <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">{title}</h1>
      {sub && <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">{sub}</p>}
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 space-y-6 text-muted-foreground leading-relaxed">
      {children}
    </section>
  );
}
