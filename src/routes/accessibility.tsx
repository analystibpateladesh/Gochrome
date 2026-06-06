import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/accessibility")({
  head: () => ({ meta: [{ title: "Accessibility — GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Accessibility" title="Designed for everyone." sub="We aim for WCAG 2.2 AA across our digital experience." />
      <Prose>
        <p>If you encounter any accessibility barriers, please email support@gochome.in. We respond within 2 business days.</p>
      </Prose>
    </>
  ),
});
