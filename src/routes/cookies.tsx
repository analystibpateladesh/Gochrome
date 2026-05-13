import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "Cookies — GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Cookie Policy" sub="How we use cookies on this site." />
      <Prose>
        <p>We use essential cookies for cart and theme preferences, and analytics cookies to understand how the site is used. You can disable non-essential cookies anytime in your browser.</p>
      </Prose>
    </>
  ),
});
