import { ArrowLeft, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { apiMessage } from "../api/client.js";
import Loading from "../components/Loading.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { money, whatsappLink } from "../config/site.js";
import { useCart } from "../context/CartContext.jsx";
import sampleProducts from "../data/sampleProducts.js";
import { findSampleProduct } from "../hooks/useProducts.js";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const sample = findSampleProduct(id);

    if (sample) {
      setProduct(sample);
      setSelectedImage(sample.images?.[0] || "");
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setSelectedImage(response.data.images?.[0] || "");
      } catch (requestError) {
        setError(apiMessage(requestError, "Product could not be loaded."));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const relatedProducts = useMemo(
    () => sampleProducts.filter((item) => item.category === product?.category && item._id !== product?._id).slice(0, 3),
    [product]
  );

  if (loading) return <Loading label="Loading product" />;

  if (error || !product) {
    return (
      <div className="container-page py-16">
        <div className="surface p-8">
          <p className="text-lg font-bold">{error || "Product not found"}</p>
          <Link to="/shop" className="btn-primary mt-5">
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const orderMessage = `Hi Go with Nonsense, I want to order ${product.name} (${money(product.price)}). Quantity: ${quantity}.`;

  return (
    <div className="py-12 sm:py-16">
      <div className="container-page">
        <Link to="/shop" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink">
          <ArrowLeft size={18} />
          Back to shop
        </Link>

        <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="aspect-square overflow-hidden rounded-lg border border-ink/10 bg-white">
              <img src={selectedImage || product.images?.[0]} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {product.images?.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((image) => (
                  <button
                    type="button"
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square overflow-hidden rounded-lg border ${
                      selectedImage === image ? "border-gold" : "border-ink/10"
                    }`}
                    aria-label="Select product image"
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:pt-6">
            <span className="badge">{product.category}</span>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-3xl font-black text-ink">{money(product.price)}</p>
            <p className="mt-5 text-base leading-8 text-ink/68">{product.description}</p>

            <div className="mt-6 grid gap-3 rounded-lg border border-ink/10 bg-white/80 p-4 text-sm text-ink/70 sm:grid-cols-3">
              <p>
                <span className="block font-bold text-ink">Finish</span>
                Glossy handmade resin
              </p>
              <p>
                <span className="block font-bold text-ink">Stock</span>
                {product.stock > 0 ? `${product.stock} available` : "Made to order"}
              </p>
              <p>
                <span className="block font-bold text-ink">Gifting</span>
                Custom note available
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex h-12 items-center rounded-lg border border-ink/10 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex h-12 w-12 items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                  className="flex h-12 w-12 items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button type="button" className="btn-primary" onClick={() => addItem(product, quantity)}>
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <a href={whatsappLink(orderMessage)} className="btn-secondary" target="_blank" rel="noreferrer">
                <MessageCircle size={18} />
                WhatsApp Order
              </a>
            </div>
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="mt-16">
            <h2 className="text-2xl font-black">You may also like</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetail;
