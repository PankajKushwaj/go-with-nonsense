import { CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api, { apiMessage } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import { brand, money, whatsappLink } from "../config/site.js";
import { useCart } from "../context/CartContext.jsx";

const initialForm = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  paymentMethod: "WhatsApp"
};

const isMongoId = (value = "") => /^[a-f\d]{24}$/i.test(value);

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const orderMessage = `Hi Go with Nonsense, I want to place this order:\n${items
    .map((item) => `${item.quantity} x ${item.name} - ${money(item.price * item.quantity)}`)
    .join("\n")}\nTotal: ${money(subtotal)}\nName: ${form.customerName}\nPhone: ${form.phone}\nAddress: ${form.address}`;

  const validate = () => {
    if (!form.customerName.trim() || !form.phone.trim() || !form.address.trim()) {
      return "Name, phone, and delivery address are required.";
    }
    if (!items.length) return "Your cart is empty.";
    return "";
  };

  const createOrderPayload = () => ({
    ...form,
    items: items.map((item) => ({
      product: isMongoId(item._id) ? item._id : undefined,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity
    }))
  });

  const runRazorpay = async (order) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) throw new Error("Razorpay key is missing in frontend environment variables.");

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) throw new Error("Razorpay checkout script could not be loaded.");

    const razorpayOrder = await api.post("/payments/create-order", {
      amount: order.totalAmount,
      orderId: order._id
    });

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key,
        amount: razorpayOrder.data.amount,
        currency: "INR",
        name: brand.name,
        description: "Handmade resin art order",
        order_id: razorpayOrder.data.id,
        prefill: {
          name: form.customerName,
          email: form.email,
          contact: form.phone
        },
        theme: {
          color: "#C9A64E"
        },
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              ...response,
              orderId: order._id
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      checkout.on("payment.failed", (response) => {
        reject(new Error(response.error?.description || "Payment failed."));
      });

      checkout.open();
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.post("/orders", createOrderPayload());

      if (form.paymentMethod === "Razorpay") {
        await runRazorpay(response.data);
        setStatus({ type: "success", message: "Payment verified and order placed successfully." });
      } else if (form.paymentMethod === "WhatsApp") {
        window.open(whatsappLink(orderMessage), "_blank", "noopener,noreferrer");
        setStatus({ type: "success", message: "Order saved. Continue the confirmation on WhatsApp." });
      } else {
        setStatus({ type: "success", message: "Order placed successfully. Payment can be handled on delivery." });
      }

      clearCart();
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: `${apiMessage(error, "Checkout failed.")} You can still send the cart on WhatsApp.`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!items.length && status.type !== "success") {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="No items to checkout"
          message="Add handmade products to your cart before checkout."
          action={
            <Link to="/shop" className="btn-primary">
              Shop Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="container-page">
        <h1 className="text-4xl font-black">Checkout</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form className="rounded-lg border border-ink/10 bg-white p-5 sm:p-8" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="customerName">
                  Name
                </label>
                <input
                  id="customerName"
                  className="input"
                  value={form.customerName}
                  onChange={(event) => updateField("customerName", event.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  Phone
                </label>
                <input id="phone" className="input" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="address">
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  className="input min-h-32 resize-y"
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="label">Payment Method</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {["WhatsApp", "COD", "Razorpay"].map((method) => (
                  <label
                    key={method}
                    className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-bold transition ${
                      form.paymentMethod === method ? "border-ink bg-ink text-cream" : "border-ink/10 bg-cream text-ink/70"
                    }`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={form.paymentMethod === method}
                      onChange={(event) => updateField("paymentMethod", event.target.value)}
                    />
                    {method === "COD" ? "Cash on Delivery" : method}
                  </label>
                ))}
              </div>
            </div>

            {status.message ? (
              <p
                className={`mt-5 rounded-lg px-4 py-3 text-sm font-semibold ${
                  status.type === "success" ? "bg-sage/15 text-sage" : "bg-red-50 text-red-700"
                }`}
              >
                {status.message}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>
                <CreditCard size={18} />
                {loading ? "Processing..." : "Place Order"}
              </button>
              <a href={whatsappLink(orderMessage)} className="btn-secondary" target="_blank" rel="noreferrer">
                <MessageCircle size={18} />
                WhatsApp Order
              </a>
            </div>
          </form>

          <aside className="h-fit rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint text-sage">
                <ShieldCheck size={21} />
              </span>
              <div>
                <h2 className="text-xl font-black">Order Summary</h2>
                <p className="text-sm text-ink/55">Secure checkout with optional Razorpay.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-ink/55">Qty {item.quantity}</p>
                  </div>
                  <p className="font-bold">{money(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-ink/10 pt-5">
              <div className="flex justify-between text-lg font-black">
                <span>Total</span>
                <span>{money(subtotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
