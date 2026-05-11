import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { brand } from "../config/site.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const links = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Custom", to: "/custom-order" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" }
];

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-blush/55 text-ink" : "text-ink/70 hover:bg-white hover:text-ink"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
      <div className="container-page">
        <nav className="flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={brand.name}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
              <img src="/brand-logo.png" alt="" className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-black">{brand.name}</span>
              <span className="hidden truncate text-xs font-semibold text-ink/55 sm:block">{brand.tagline}</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/shop" className="icon-btn" aria-label="Search products" title="Search products">
              <Search size={18} />
            </Link>
            <Link to={isAuthenticated ? "/admin" : "/login"} className="icon-btn" aria-label="Admin login" title="Admin">
              <UserRound size={18} />
            </Link>
            <Link to="/cart" className="icon-btn relative" aria-label="Cart" title="Cart">
              <ShoppingBag size={18} />
              {itemCount ? (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-black text-ink">
                  {itemCount}
                </span>
              ) : null}
            </Link>
            <button type="button" className="icon-btn lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {open ? (
        <div className="border-t border-ink/10 bg-cream lg:hidden">
          <div className="container-page grid gap-2 py-4">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
