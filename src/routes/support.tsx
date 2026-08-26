import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — GoChrome" }] }),
  component: () => (
    <>
      <PageHeader
        eyebrow="Support"
        title="We're here to help."
        sub="Find answers, manage your order, or talk to a human."
      />
      <section className="mx-auto max-w-5xl px-6 pb-24 grid sm:grid-cols-2 gap-4">
        {[
          ["/contact", "Contact us", "Get a response within 24 hours."],
          ["/shipping", "Shipping", "Free shipping across India."],
        ].map(([to, t, d]) => (
          <Link key={t} to={to} className="card-soft p-6">
            <h3 className="font-semibold">{t}</h3>
            <p className="text-sm text-muted-foreground mt-1">{d}</p>
          </Link>
        ))}
      </section>
    </>
  ),
});
