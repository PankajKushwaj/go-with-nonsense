import { ArrowRight, Gem, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { whatsappLink } from "../config/site.js";
import { useProducts } from "../hooks/useProducts.js";

const jewelleryTypes = ["Resin Pendants", "Earrings", "Bracelets", "Rings", "Custom Name Charms", "Gift Sets"];

const careNotes = [
  "Lightweight handmade resin finish",
  "Pastel pigments, florals, flakes, and charms",
  "Custom colors and initials available"
];

const Jewellery = () => {
  const { products, loading, error } = useProducts({ category: "Jewellery" });

  return (
    <>
      <section className="overflow-hidden bg-white/55 py-14 sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cream px-4 py-2 text-sm font-semibold text-sage">
              <Gem size={16} />
              Handmade jewellery collection
            </p>
            <h1 className="text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
              Resin jewellery made for everyday sparkle
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink/68">
              Shop handmade pendants, earrings, bracelets, rings, and custom jewellery pieces with soft pastel colors,
              florals, shimmer, and premium gift-ready finishing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop?category=Jewellery" className="btn-primary">
                Shop Jewellery
                <ArrowRight size={18} />
              </Link>
              <a
                href={whatsappLink("Hi Go with Nonsense, I want to order custom handmade jewellery.")}
                className="btn-secondary"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                WhatsApp Order
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-ink/10 bg-lavender/25 shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1531995811006-35cb42e1a022?auto=format&fit=crop&w=1200&q=85"
                alt="Handmade jewellery displayed with soft styling"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 rounded-lg border border-ink/10 bg-cream/95 p-4 shadow-soft backdrop-blur sm:left-8 sm:right-8">
              <div className="grid gap-3 sm:grid-cols-3">
                {careNotes.map((note) => (
                  <div key={note} className="flex items-start gap-2 text-sm font-semibold text-ink/70">
                    <Sparkles className="mt-0.5 shrink-0 text-gold" size={16} />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Jewellery"
              title="Pendants, earrings, bracelets, and custom charms"
              description="Browse available jewellery pieces, or send a custom request for matching colors, initials, names, resin florals, and gift-ready packaging."
            />
            <Link to="/custom-order" className="btn-secondary">
              Custom Jewellery
              <Heart size={18} />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {jewelleryTypes.map((type) => (
              <span key={type} className="badge">
                {type}
              </span>
            ))}
          </div>

          {error ? <p className="mt-6 rounded-lg bg-gold/15 px-4 py-3 text-sm font-semibold text-ink/70">{error}</p> : null}

          {loading ? <Loading label="Loading jewellery" /> : null}

          {!loading && products.length ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : null}

          {!loading && !products.length ? (
            <EmptyState
              title="Jewellery products are coming soon"
              message="Add jewellery products from the admin dashboard using the Jewellery category, or accept custom jewellery requests through the custom order form."
              action={
                <Link to="/custom-order" className="btn-primary">
                  Request Custom Jewellery
                </Link>
              }
            />
          ) : null}
        </div>
      </section>
    </>
  );
};

export default Jewellery;
