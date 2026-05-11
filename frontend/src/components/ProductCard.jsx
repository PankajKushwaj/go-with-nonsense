import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { money } from "../config/site.js";
import { useCart } from "../context/CartContext.jsx";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const image = product.images?.[0] || product.image;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/products/${product._id}`} className="relative block aspect-square overflow-hidden bg-lavender/20">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.isFeatured ? (
          <span className="absolute left-3 top-3 rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink shadow">
            Featured
          </span>
        ) : null}
        <button
          type="button"
          aria-label={`Save ${product.name}`}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-blush"
        >
          <Heart size={17} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm font-semibold text-sage">{product.category}</p>
        <Link to={`/products/${product._id}`} className="mt-2">
          <h3 className="line-clamp-2 min-h-12 text-lg font-bold text-ink">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-lg font-bold text-ink">{money(product.price)}</p>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="icon-btn"
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
