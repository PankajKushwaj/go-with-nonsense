import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import { money, whatsappLink } from "../config/site.js";
import { useCart } from "../context/CartContext.jsx";

const Cart = () => {
  const { items, subtotal, updateQty, removeItem } = useCart();

  const cartMessage = `Hi Go with Nonsense, I want to order:\n${items
    .map((item) => `${item.quantity} x ${item.name} - ${money(item.price * item.quantity)}`)
    .join("\n")}\nTotal: ${money(subtotal)}`;

  if (!items.length) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Your cart is empty"
          message="Browse handmade products and add your favorite resin art pieces."
          action={
            <Link to="/shop" className="btn-primary">
              <ShoppingBag size={18} />
              Shop Now
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="container-page">
        <h1 className="text-4xl font-black">Cart</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="grid gap-4">
            {items.map((item) => (
              <article key={item._id} className="rounded-lg border border-ink/10 bg-white p-4">
                <div className="grid gap-4 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                  <img src={item.image} alt={item.name} className="h-28 w-28 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-sage">{item.category}</p>
                    <h2 className="mt-1 text-xl font-bold">{item.name}</h2>
                    <p className="mt-2 font-bold">{money(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 items-center rounded-lg border border-ink/10 bg-cream">
                      <button
                        type="button"
                        onClick={() => updateQty(item._id, item.quantity - 1)}
                        className="flex h-11 w-10 items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item._id, item.quantity + 1)}
                        className="flex h-11 w-10 items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="icon-btn"
                      aria-label={`Remove ${item.name}`}
                      title="Remove"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black">Order Summary</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/60">Subtotal</span>
                <span className="font-bold">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Shipping</span>
                <span className="font-bold">Calculated after confirmation</span>
              </div>
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <div className="flex justify-between text-lg font-black">
                <span>Total</span>
                <span>{money(subtotal)}</span>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <Link to="/checkout" className="btn-primary">
                Checkout
              </Link>
              <a href={whatsappLink(cartMessage)} className="btn-secondary" target="_blank" rel="noreferrer">
                WhatsApp Cart
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
