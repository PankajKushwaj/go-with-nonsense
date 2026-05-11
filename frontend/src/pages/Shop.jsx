import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { categories } from "../config/site.js";
import { useProducts } from "../hooks/useProducts.js";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const { products, loading, error } = useProducts({ category, search });

  useEffect(() => {
    const params = {};
    if (category !== "All") params.category = category;
    if (search.trim()) params.search = search.trim();
    setSearchParams(params, { replace: true });
  }, [category, search, setSearchParams]);

  return (
    <div className="py-12 sm:py-16">
      <div className="container-page">
        <SectionHeader
          eyebrow="Shop"
          title="Browse handmade resin art and creative crafts"
          description="Filter by category or search for the exact keepsake, decor piece, jewellery item, or gift set you have in mind."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-lg border border-ink/10 bg-white/80 p-4">
            <label className="label" htmlFor="search">
              Search products
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 text-ink/40" size={18} />
              <input
                id="search"
                className="input pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Keychain, frame, clock..."
              />
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-ink">Categories</p>
              <div className="grid gap-2">
                {["All", ...categories].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                      category === item ? "bg-ink text-cream" : "bg-cream text-ink/70 hover:bg-blush/35 hover:text-ink"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink/60">{products.length} products found</p>
              {error ? <p className="rounded-lg bg-gold/15 px-4 py-2 text-sm font-semibold text-ink/70">{error}</p> : null}
            </div>

            {loading ? <Loading label="Loading products" /> : null}

            {!loading && products.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : null}

            {!loading && !products.length ? (
              <EmptyState
                title="No products found"
                message="Try a different category or search term, or send a custom order request."
              />
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shop;
