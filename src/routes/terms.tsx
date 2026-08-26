import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms — GoChrome" }] }),
  component: () => (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        sub="By using GoChrome.audio you agree to these terms."
      />
      <Prose>
        <p>
          All content, designs, and trademarks are the property of GoChrome Audio Pvt. Ltd.
          Unauthorized reproduction is prohibited.
        </p>
        <p>
          Pricing, availability, and product specifications are subject to change without notice.
        </p>
      </Prose>
    </>
  ),
});
