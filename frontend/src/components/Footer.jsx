import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { brand, categories, whatsappLink } from "../config/site.js";

const Footer = () => (
  <footer className="border-t border-ink/10 bg-ink text-cream">
    <div className="container-page grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
      <div>
        <Link to="/" className="inline-flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-cream/20 bg-cream">
            <img src="/brand-logo.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span>
            <span className="block text-xl font-black">{brand.name}</span>
            <span className="text-sm text-cream/65">{brand.tagline}</span>
          </span>
        </Link>
        <p className="mt-5 max-w-md leading-7 text-cream/70">
          Hand-poured resin art, custom gifting, and creative craft pieces made for memories, desks, walls, and celebrations.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={whatsappLink("Hi Go with Nonsense, I want to place an order.")} className="btn-secondary" target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            WhatsApp
          </a>
          <a href={brand.instagramUrl} className="btn-secondary" target="_blank" rel="noreferrer">
            <Instagram size={18} />
            Instagram
          </a>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-cream">Shop</h3>
        <div className="mt-4 grid gap-2">
          {categories.slice(0, 6).map((category) => (
            <Link key={category} to={`/shop?category=${encodeURIComponent(category)}`} className="text-sm text-cream/65 transition hover:text-cream">
              {category}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-cream">Contact</h3>
        <div className="mt-4 grid gap-3 text-sm text-cream/70">
          <a href={`mailto:${brand.email}`} className="flex items-center gap-2 transition hover:text-cream">
            <Mail size={16} />
            {brand.email}
          </a>
          <a href={whatsappLink("Hi, I need help with an order.")} className="flex items-center gap-2 transition hover:text-cream" target="_blank" rel="noreferrer">
            <MessageCircle size={16} />
            WhatsApp Orders
          </a>
          <span className="flex items-center gap-2">
            <MapPin size={16} />
            Handmade in India
          </span>
        </div>
      </div>
    </div>
    <div className="border-t border-cream/10 py-5">
      <div className="container-page flex flex-col gap-2 text-sm text-cream/55 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
        <p>Made for custom gifts, keepsakes, and artful everyday things.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
