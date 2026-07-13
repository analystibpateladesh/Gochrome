import { Link, useRouterState } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { useCart } from "@/lib/cart";
import { Moon, Sun, ShoppingBag, Menu, X, Map } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/gochrome-wordmark.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/chrome", label: "Store" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/waitlist", label: "GoChrome Waitlist" },
  { to: "/track", label: "Track Order" }
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: s => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex min-w-0 items-center" aria-label="GoChrome home">
          <img src={logo} alt="GoChrome" className="h-9 w-40 object-contain object-left mix-blend-multiply dark:invert sm:h-10 sm:w-48" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map(n => (
            <Link key={n.to} to={n.to} className={`text-sm transition-colors hover:text-foreground ${path === n.to ? "text-foreground" : "text-muted-foreground"}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme" className="h-9 w-9 grid place-items-center rounded-full hover:bg-accent transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
  to="/track"
  aria-label="Track order"
  className="flex items-center whitespace-nowrap px-2 py-1 rounded-full hover:bg-accent transition-colors"
>
  <span className="text-xs font-medium whitespace-nowrap">
    Track Order
  </span>
</Link>
          <Link to="/cart" className="h-9 px-3 rounded-full hover:bg-accent transition-colors flex items-center gap-2 text-sm">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-accent">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-6 py-4 flex flex-col gap-3">
            {nav.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-sm py-1">{n.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
