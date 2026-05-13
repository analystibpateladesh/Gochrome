import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/press")({
  head: () => ({ meta: [{ title: "Press-GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Press" title="In the news." sub="For media inquiries, brand assets, and product samples." />
      <Prose>
        <p>Press contact: <span className="text-foreground">gochromeaudio@gmail.com</span></p>
        <p>Download our brand kit, hi-res product photography, and executive bios.</p>
      </Prose>
    </>
  ),
});
