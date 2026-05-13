import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy - GoChrome" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Privacy Policy" title="Privacy Policy" sub="Last Updated: May 12, 2026" />
      <Prose>
        <p>At GoChrome, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or purchase our products.</p>

        <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
        <p>When you place an order or contact us, we may collect the following information:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Full name</li>
          <li>Phone number</li>
          <li>Email address</li>
          <li>Shipping and billing address</li>
          <li>Payment information</li>
          <li>IP address and browser information</li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Process and fulfill your orders</li>
          <li>Provide customer support</li>
          <li>Send order confirmations and tracking updates</li>
          <li>Process returns and refunds</li>
          <li>Improve our website and services</li>
          <li>Prevent fraud and unauthorized transactions</li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Payment Information</h2>
        <p>Payments are processed securely through trusted third-party payment providers. We do not store your debit card, credit card, or banking details on our servers.</p>

        <h2 className="text-2xl font-semibold text-foreground">Sharing of Information</h2>
        <p>We do not sell, trade, or rent your personal information to third parties.</p>
        <p>We may share your information only with trusted service providers, such as:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Payment gateways</li>
          <li>Shipping and courier partners</li>
          <li>Customer support providers</li>
          <li>Legal authorities when required by law</li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Cookies</h2>
        <p>Our website may use cookies to enhance your browsing experience, remember preferences, and analyze website traffic.</p>
        <p>You can disable cookies in your browser settings if you prefer.</p>

        <h2 className="text-2xl font-semibold text-foreground">Data Security</h2>
        <p>We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, or misuse.</p>
        <p>However, no method of transmission over the internet is completely secure.</p>

        <h2 className="text-2xl font-semibold text-foreground">Your Rights</h2>
        <p>You may request to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Delete your personal information, subject to legal and operational requirements</li>
        </ul>
        <p>To make a request, contact us at the email address below.</p>

        <h2 className="text-2xl font-semibold text-foreground">Third-Party Services</h2>
        <p>Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of those websites.</p>

        <h2 className="text-2xl font-semibold text-foreground">Children's Privacy</h2>
        <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children.</p>

        <h2 className="text-2xl font-semibold text-foreground">Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with the updated effective date.</p>

        <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or how your information is handled, please contact us:</p>
        <p>Email: gochromeaudio@gmail.com</p>
        <p>Response Time: Within 24 hours on business days</p>
      </Prose>
    </>
  ),
});
