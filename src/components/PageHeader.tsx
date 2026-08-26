import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  sub,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`mx-auto max-w-7xl px-6 animate-fade-up ${compact ? "pt-8 pb-5" : "pt-10 pb-8 md:pt-16 md:pb-10"}`}
    >
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link to="/" className="transition hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground/70">{eyebrow ?? title}</span>
      </nav>
      {eyebrow && (
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      )}
      <h1
        className={`${compact ? "text-4xl md:text-5xl" : "text-5xl md:text-7xl"} font-semibold tracking-tight`}
      >
        {title}
      </h1>
      {sub && <p className="mt-3 max-w-2xl text-lg text-muted-foreground md:text-xl">{sub}</p>}
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
