import { Brush, Gem, Gift, HeartHandshake } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import { brand } from "../config/site.js";

const values = [
  {
    icon: Gem,
    title: "Premium finish",
    text: "Each piece is poured, finished, checked, and packed with a clean glossy look."
  },
  {
    icon: Brush,
    title: "Creative details",
    text: "Pastel pigments, florals, flakes, shimmer, photos, names, and themes are mixed with care."
  },
  {
    icon: Gift,
    title: "Gifting ready",
    text: "Products are designed to feel special from the first look to the unboxing moment."
  },
  {
    icon: HeartHandshake,
    title: "Custom friendly",
    text: "WhatsApp-first conversations make personalization simple and transparent."
  }
];

const About = () => (
  <div className="py-12 sm:py-16">
    <div className="container-page">
      <section className="grid items-center gap-10 lg:grid-cols-[0.9fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
          <img
            src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85"
            alt="Handmade craft materials arranged on a creative table"
            className="h-full min-h-96 w-full object-cover"
          />
        </div>
        <div>
          <SectionHeader
            eyebrow="About"
            title={`A handmade brand with a playful name and polished craft`}
            description={`${brand.name} creates resin art, keepsakes, decor, jewellery, and handmade craft gifts with a pastel-premium look. The store is built for easy browsing, custom order clarity, and quick WhatsApp conversations.`}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-ink/10 bg-white p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-lavender/35 text-ink">
                  <Icon size={21} />
                </span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-lg bg-ink p-6 text-cream sm:p-10">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["01", "Choose a product", "Pick a ready piece or select a category for custom work."],
            ["02", "Personalize details", "Share colors, names, dates, budget, and a reference image."],
            ["03", "Confirm and create", "Approve the final plan, pay online or later, and track progress."]
          ].map(([number, title, text]) => (
            <div key={number}>
              <p className="text-sm font-bold text-gold">{number}</p>
              <h3 className="mt-3 text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-cream/68">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export default About;
