import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Order - GoChrome" }] }),
  component: Track,
});

const API_URL =
  "https://script.google.com/macros/s/AKfycbyQ1pvtPZ4I1Fz_o8LQyqnYlMUId8oxWD8nBceE9OUvNMbjUnuvsWUx50mLEXS0dxM02g/exec";

const STAGE_ORDER = ["Ordered", "Packed", "Dispatched", "Shipped", "Delivered"];

type OrderData = {
  found: boolean;
  name?: string;
  orderId?: string;
  status?: string;
  submittedAt?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Track() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OrderData | null>(null);

  const trackOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = orderId.trim();

    if (!id) {
      setError("Type in the Order ID from your confirmation email to track your package.");
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}?orderId=${encodeURIComponent(id)}`);
      const json: OrderData = await res.json();

      if (!json.found) {
        setError("Double-check your Order ID and try again — it should look like GC-PREORDER-XXXXXXXXXX.");
        setData(null);
        return;
      }

      setData(json);
    } catch {
      setError("We couldn't reach the tracking service. Please try again in a moment.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = data?.status ? STAGE_ORDER.indexOf(data.status) : -1;

  return (
    <>
      <PageHeader
        eyebrow="Track order"
        title="Track your order."
        sub="Enter your Order ID to see where your GoChrome earphones are right now."
      />
      <section className="mx-auto max-w-2xl px-6 pb-24">
        <form onSubmit={trackOrder} className="flex gap-2 rounded-xl border border-border bg-background p-2">
          <input
            name="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. GC-PREORDER-1781418482642"
            autoComplete="off"
            className="flex-1 bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Track"}
          </button>
        </form>
        <p className="mt-2.5 px-0.5 text-xs text-muted-foreground">
          You'll find this in your order confirmation email.
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-background p-5">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-destructive/15 text-xs font-bold text-destructive">
              !
            </div>
            <div>
              <div className="mb-0.5 text-sm font-semibold text-foreground">We couldn't find that order</div>
              <div className="text-sm leading-relaxed text-muted-foreground">{error}</div>
            </div>
          </div>
        )}

        {data && (
          <>
            <div className="mt-7 rounded-xl border border-border bg-background p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mb-1 font-display text-lg font-bold text-foreground">{data.name || "—"}</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order placed {formatDate(data.submittedAt)}
                  </p>
                </div>
                <div className="whitespace-nowrap rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 font-mono text-[11.5px] font-semibold text-amber-600">
                  {data.orderId}
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2.5 border-b border-border pb-5 text-sm font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                </span>
                Current status: <strong className="font-bold text-foreground">{data.status}</strong>
              </div>

              <div className="mb-1.5 flex items-start">
                {STAGE_ORDER.map((stage, i) => {
                  const isDone = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const isFinal = stage === "Delivered";

                  return (
                    <div key={stage} className="flex flex-1 flex-col items-center text-center">
                      <div className="flex w-full items-center">
                        <div
                          className={`h-0.5 flex-1 ${i === 0 ? "invisible" : ""} ${
                            isDone || isCurrent ? "bg-amber-500" : "bg-muted"
                          }`}
                        />
                        {isCurrent ? (
                          <span className="relative flex h-4 w-4 flex-shrink-0">
                            <span
                              className={`absolute inline-flex h-full w-full animate-ping rounded-[5px] opacity-60 ${
                                isFinal ? "bg-emerald-400" : "bg-orange-400"
                              }`}
                            />
                            <span
                              className={`relative inline-flex h-4 w-4 rounded-[5px] ${
                                isFinal ? "bg-emerald-500" : "bg-orange-500"
                              }`}
                            />
                          </span>
                        ) : (
                          <div
                            className={`h-4 w-4 flex-shrink-0 rounded-[5px] border-[1.5px] ${
                              isDone
                                ? isFinal
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-amber-500 bg-amber-500"
                                : "border-muted bg-muted"
                            }`}
                          />
                        )}
                        <div
                          className={`h-0.5 flex-1 ${i === STAGE_ORDER.length - 1 ? "invisible" : ""} ${
                            isDone ? "bg-amber-500" : "bg-muted"
                          }`}
                        />
                      </div>
                      <div
                        className={`mt-2.5 max-w-[78px] text-[11.5px] leading-tight ${
                          isCurrent
                            ? "font-bold text-foreground"
                            : isDone
                              ? "font-semibold text-foreground"
                              : "font-semibold text-muted-foreground"
                        }`}
                      >
                        {stage}
                      </div>
                      {stage === "Ordered" && (
                        <div className="mt-1 font-mono text-[10px] font-semibold text-muted-foreground">
                          {formatDate(data.submittedAt)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Delivering to
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {data.city || ""}, {data.state || ""}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    PIN code
                  </div>
                  <div className="text-sm font-semibold text-foreground">{data.pincode || "—"}</div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Any issue?{" "}
              <a href="mailto:gochromeaudio@gmail.com" className="font-bold text-amber-600 underline">
                Contact our team
              </a>
            </p>
          </>
        )}
      </section>
    </>
  );
}