import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/sustainability")({
  head: () => ({ meta: [{ title: "Sustainability — GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Sustainability" title="Built to last. By design." sub="A product that lasts is the most sustainable product." />
      <Prose>
        <p>Our packaging uses 100% recycled fibers. Our drivers are user-replaceable. We offer a buy-back program for end-of-life devices.</p>
        <p>By 2027, every GoChrome product will be carbon-neutral across its full lifecycle.</p>
      </Prose>
    </>
  ),
});
