import { Link } from "@tanstack/react-router";

const cols = [
  { title: "Shop", links: [["/chrome","Chrome Earphones"],["/chrome","All Products"],["/chrome","Accessories"],["/cart","Cart"]] },
  { title: "Company", links: [["/about","About"],["/careers","Careers"],["/privacy","Privacy Policy"]] },
  { title: "Support", links: [["/contact","Contact Us"],["/shipping","Shipping"],["/track","Track Order"]] },
] as const;

export function Footer() {
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
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GoChrome Audio. Engineered in India.</p>
          <p className="tracking-widest">PRECISION · SOUND · DESIGN</p>
        </div>
      </div>
    </footer>
  );
}
