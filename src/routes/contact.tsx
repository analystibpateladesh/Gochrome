import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { saveToGoogleSheets } from "@/lib/google-sheets";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact - GoChrome" }] }),
  component: Contact,
});

function Contact() {
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await saveToGoogleSheets({
        type: "contact",
        name: data.get("name"),
        email: data.get("email"),
        subject: data.get("subject"),
        message: data.get("message"),
      });
      toast.success("Message sent. We'll be in touch.");
      form.reset();
    } catch {
      toast.error("Message could not be sent. Please email support@gochome.in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to us." sub="support@gochome.in · gochromeaudio@gmail.com · +91 9140579643" />
      <section className="mx-auto max-w-2xl px-6 pb-24">
        <form onSubmit={submit} className="space-y-4">
          <input name="name" required type="text" placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          <input name="email" required type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          <input name="subject" required type="text" placeholder="Subject" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          <textarea name="message" required placeholder="Message" rows={6} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={loading} className="px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
            {loading ? "Sending..." : "Send message"}
          </button>
        </form>
      </section>
    </>
  );
}
