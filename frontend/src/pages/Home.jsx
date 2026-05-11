import { ArrowRight, Gift, Instagram, Palette, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { brand, categories } from "../config/site.js";
import { useProducts } from "../hooks/useProducts.js";

const categoryIcons = [Sparkles, Gift, Wand2, Palette];

const reviews = [
  {
    name: "Aditi",
    text: "The keychains were so neatly made and the packaging looked beautiful for gifting."
  },
  {
    name: "Rhea",
    text: "Loved the custom frame. They understood the colors I wanted and made it feel personal."
  },
  {
    name: "Nisha",
    text: "Premium finish, quick updates on WhatsApp, and the final piece looked better than expected."
  }
];

const Home = () => {
  const { products, loading, error } = useProducts({ featured: true });

  return (
    <>
      <section
        className="relative min-h-[76vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,249,240,0.96) 0%, rgba(255,249,240,0.82) 42%, rgba(255,249,240,0.18) 100%), url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1800&q=85')"
        }}
      >
        <div className="container-page flex min-h-[76vh] items-center py-16">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-4 inline-flex rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-semibold text-sage">
              Custom gifts / Resin decor / Handmade keepsakes
            </p>
            <h1 className="text-5xl font-black leading-tight text-ink sm:text-6xl lg:text-7xl">{brand.name}</h1>
            <p className="mt-5 text-xl font-semibold text-ink/75 sm:text-2xl">{brand.tagline}</p>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink/68">
              Premium pastel resin art, thoughtful handmade crafts, and custom pieces designed for birthdays, weddings,
              home corners, and tiny everyday joy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Products
                <ArrowRight size={18} />
              </Link>
              <Link to="/custom-order" className="btn-secondary">
                Create Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/60 py-10">
        <div className="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category, index) => {
            const Icon = categoryIcons[index] || Sparkles;
            return (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="group flex items-center gap-4 rounded-lg border border-ink/10 bg-cream p-4 transition hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blush/50 text-ink transition group-hover:bg-gold/25">
                  <Icon size={22} />
                </span>
                <span>
                  <span className="block font-bold text-ink">{category}</span>
                  <span className="text-sm text-ink/55">Explore collection</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Featured"
              title="Handmade pieces ready to gift"
              description="Browse best-loved resin and craft products, then add your own custom details when you need something one of a kind."
            />
            <Link to="/shop" className="btn-secondary">
              View Shop
              <ArrowRight size={18} />
            </Link>
          </div>

          {error ? <p className="mt-6 rounded-lg bg-gold/15 px-4 py-3 text-sm font-semibold text-ink/70">{error}</p> : null}

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(loading ? [] : products.slice(0, 4)).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[420px] animate-pulse rounded-lg bg-white/70" />
                ))
              : null}
          </div>
        </div>
      </section>

      <section className="bg-mint/45 py-16 sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeader
              eyebrow="Custom Orders"
              title="Turn a color, memory, or name into a handmade gift"
              description="Submit your idea with budget, delivery date, and a reference image. The admin dashboard keeps every custom request organized from discussion to completion."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/custom-order" className="btn-primary">
                Start Custom Order
              </Link>
              <Link to="/contact" className="btn-secondary">
                Ask a Question
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Choose colors", "Share reference", "Approve quote", "Receive handmade piece"].map((step, index) => (
              <div key={step} className="rounded-lg border border-ink/10 bg-white/80 p-5">
                <span className="text-sm font-bold text-gold">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-bold">{step}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/60">
                  A simple creative process built around clear communication and handcrafted detail.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Reviews"
            title="Loved by thoughtful gifters"
            description="A store experience made for quick browsing, clear custom requests, and easy WhatsApp conversations."
            align="center"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <figure key={review.name} className="rounded-lg border border-ink/10 bg-white p-6">
                <blockquote className="leading-7 text-ink/70">"{review.text}"</blockquote>
                <figcaption className="mt-4 font-bold text-ink">{review.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blush/35 py-12">
        <div className="container-page flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">Instagram-friendly drops and behind-the-scenes craft moments</h2>
            <p className="mt-2 text-ink/65">Follow new launches, packaging reels, and custom order stories.</p>
          </div>
          <a href={brand.instagramUrl} className="btn-primary" target="_blank" rel="noreferrer">
            <Instagram size={18} />
            Open Instagram
          </a>
        </div>
      </section>
    </>
  );
};

export default Home;
