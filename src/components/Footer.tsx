import { Link } from "@tanstack/react-router";

const cols = [
  { title: "Shop", links: [["/chrome","Chrome Earphones"],["/shop","All Products"],["/shop","Accessories"],["/cart","Cart"]] },
  { title: "Company", links: [["/about","About"],["/careers","Careers"],["/privacy","Privacy Policy"]] },
  { title: "Support", links: [["/contact","Contact Us"],["/shipping","Shipping"]] },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-3 gap-10">
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
