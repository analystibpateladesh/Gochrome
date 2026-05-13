import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/warranty")({
  head: () => ({ meta: [{ title: "Warranty — GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Warranty" title="Two-year limited warranty." sub="Every GoChrome product is covered for two years from the date of purchase." />
      <Prose>
        <p>The warranty covers manufacturing defects in materials and workmanship. It does not cover damage from accident, misuse, or unauthorized modification.</p>
        <p>To file a claim, visit our Support page with your order number.</p>
      </Prose>
    </>
  ),
});
