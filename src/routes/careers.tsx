import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: "Careers - GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Careers" title="Careers" />
      <Prose>
        <p>Thank you for your interest in joining GoChrome.</p>
        <p>We are not hiring at the moment and do not have any open positions available right now.</p>
        <p>Please check back in the future for new opportunities as our team grows.</p>
        <p>For general inquiries, feel free to contact us at gochromeaudio@gmail.com</p>
      </Prose>
    </>
  ),
});
