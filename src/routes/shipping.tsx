import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Prose } from "@/components/PageHeader";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping & Returns - GoChrome" }] }),
  component: () => (
    <>
      <PageHeader
        eyebrow="Shipping & Returns"
        title="Shipping & Returns"
        sub="At GoChrome, we strive to provide a smooth and hassle-free shopping experience. Please read our shipping and return policy below."
      />
      <Prose>
        <h2 className="text-2xl font-semibold text-foreground">Shipping Information</h2>
        <h3 className="text-lg font-semibold text-foreground">Order Processing</h3>
        <p>Most orders are processed and shipped on the same day they are placed. In some cases, processing may take up to 1 business day.</p>
        <h3 className="text-lg font-semibold text-foreground">Delivery Time</h3>
        <p>Orders are typically delivered within 2-7 business days, depending on your location.</p>
        <h3 className="text-lg font-semibold text-foreground">Shipping Charges</h3>
        <p>We offer free shipping across India on all orders.</p>
        <h3 className="text-lg font-semibold text-foreground">Order Tracking</h3>
        <p>Once your order is shipped, you will receive a tracking link via SMS or email so you can monitor your package in real time.</p>

        <h2 className="text-2xl font-semibold text-foreground">Returns & Refunds</h2>
        <h3 className="text-lg font-semibold text-foreground">7-Day Return & Refund Policy</h3>
        <p>Returns and refunds are only available for products that arrive damaged or defective.</p>
        <p>To be eligible for a return or refund, you must record a complete unboxing video from the moment the sealed package is opened until the product is fully inspected.</p>
        <p>Claims submitted without a valid unboxing video will not be accepted under any circumstances, including cases of damaged or defective items.</p>
        <p>The product must also be returned in its original condition with all included accessories and packaging.</p>
        <h3 className="text-lg font-semibold text-foreground">How to Request a Return or Refund</h3>
        <p>To initiate a return or refund, email us at gochromeaudio@gmail.com with the following details:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your order number</li>
          <li>Reason for return</li>
          <li>Unboxing video showing the defect or issue</li>
          <li>Photos, if applicable</li>
        </ul>
        <p>Our support team will review your request and respond within 24 hours.</p>
        <h3 className="text-lg font-semibold text-foreground">Refund Processing</h3>
        <p>Once we receive and inspect the returned product, your refund will be processed within 5-7 business days to your original payment method.</p>
        <p>For Cash on Delivery (COD) orders, refunds will be sent to your bank account or UPI ID.</p>

        <h2 className="text-2xl font-semibold text-foreground">Damaged or Incorrect Products</h2>
        <p>If you receive a damaged, defective, or incorrect product, please contact us within 48 hours of delivery.</p>

        <h2 className="text-2xl font-semibold text-foreground">Non-Returnable Situations</h2>
        <p>Returns may not be accepted if:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>The return request is made after 7 days of delivery.</li>
          <li>The product is used extensively or damaged by the customer.</li>
          <li>Original packaging or accessories are missing.</li>
          <li>A valid unboxing video is not provided.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
        <p>If you have any questions regarding shipping or returns, please contact us at:</p>
        <p>Email: gochromeaudio@gmail.com</p>
        <p>Response Time: Within 24 hours on business days</p>
      </Prose>
    </>
  ),
});
