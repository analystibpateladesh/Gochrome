import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About - GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="About Us" title="About Us" />
      <Prose>
        <p>
          At GoChrome, we believe everyday tech should do more than just function, it should make a
          statement.
        </p>
        <p>
          We sell Chrome Earphones to combine stylish design with dependable performance. Inspired
          by the bold look of mirror-finished chrome, our products are designed for people who want
          their accessories to stand out while delivering clear, high-quality sound.
        </p>
        <p>
          Our mission is simple: to offer stylish, premium-looking audio products at an affordable
          price. Whether you're listening to music, attending online classes, taking calls, or
          watching your favorite content, GoChrome is built to enhance your everyday experience.
        </p>
        <p>We focus on three things:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-medium text-foreground">Design That Stands Out</span> - A unique
            chrome finish that turns heads.
          </li>
          <li>
            <span className="font-medium text-foreground">Reliable Performance</span> - Clear sound,
            deep bass, and a built-in microphone.
          </li>
          <li>
            <span className="font-medium text-foreground">Customer Satisfaction</span> - Fast
            shipping, secure payments, and a 7-day return policy.
          </li>
        </ul>
        <p>
          At GoChrome, we are committed to delivering products that look exceptional, perform
          reliably, and provide great value.
        </p>
        <p>Thank you for choosing GoChrome.</p>
      </Prose>
    </>
  ),
});
