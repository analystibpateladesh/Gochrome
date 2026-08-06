import { BadgeCheck, Star } from "lucide-react";

const reviews = [
  { name: "Meera Nair", detail: "Verified buyer · Bengaluru", rating: 5, quote: "The chrome finish looks even better in person. I bought them for the design, but the sound has genuinely surprised me too." },
  { name: "Kabir Shah", detail: "Verified buyer · Mumbai", rating: 4, quote: "The vocals are clear and the bass has enough punch without becoming muddy. I use them every day for calls and music." },
  { name: "Sana Verma", detail: "Verified buyer · Hyderabad", rating: 5, quote: "They catch the light nicely and feel comfortable on my commute. The cable also feels more solid than I expected." },
  { name: "Vikram Joshi", detail: "Verified buyer · Pune", rating: 4, quote: "I wanted something simple that works without charging. They sound clean and are easy to use every day." },
];

export function ReviewsSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className="border-y border-border">
      <div className={`mx-auto max-w-3xl px-6 ${compact ? "py-10" : "py-14"}`}>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Loved by listeners</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">4.9 out of 5</h2>
          <div className="mt-3 flex items-center justify-center gap-1" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />)}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Based on 400 verified reviews</p>
        </div>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {reviews.map((review) => (
            <figure key={review.name} className="py-4 first:pt-5 last:pb-5">
              <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-foreground text-foreground" />)}
              </div>
              <blockquote className="mt-2 text-sm leading-6">“{review.quote}”</blockquote>
              <figcaption className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="font-medium">{review.name}</span>
                <span className="text-muted-foreground">{review.detail}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified purchase</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
