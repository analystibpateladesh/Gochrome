import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

const cols = [
  { title: "Shop", links: [["/chrome","Chrome Earphones"],["/chrome","All Products"],["/chrome","Accessories"],["/cart","Cart"]] },
  { title: "Company", links: [["/about","About"],["/careers","Careers"],["/privacy","Privacy Policy"]] },
  { title: "Support", links: [["/contact","Contact Us"],["/shipping","Shipping"],["/track","Track Order"]] },
] as const;

export function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ to: "/waitlist" });
  };

  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {cols.map(col => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Follow Our Socials</h4>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/gochrome.in/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-foreground"
              aria-label="Go to Instagram @gochrome.in"
            >
              <svg
                viewBox="0 0 512 512"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="32"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="48" y="48" width="416" height="416" rx="128" ry="128" />
                <path d="M352 160a32 32 0 1 1-32-32 32 32 0 0 1 32 32z" />
                <path d="M352 256a96 96 0 1 1-96-96 96 96 0 0 1 96 96z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="mb-5 sm:mb-0">
            <h4 className="text-lg font-semibold tracking-tight">Join the GoChrome email list</h4>
            <p className="mt-1 text-sm text-muted-foreground">Get updates on new launches and exclusive offers.</p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-lg gap-2">
            <input
              type="email"
              name="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              autoComplete="email"
              required
              className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GoChrome Audio. Engineered in India.</p>
          <p className="tracking-widest">PRECISION · SOUND · DESIGN</p>
        </div>
      </div>
    </footer>
  );
}
