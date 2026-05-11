import { CalendarDays, ImagePlus, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import api, { apiMessage } from "../api/client.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { categories, money, whatsappLink } from "../config/site.js";

const initialForm = {
  customerName: "",
  phone: "",
  email: "",
  productType: categories[0],
  designDetails: "",
  budget: "",
  deliveryDate: ""
};

const CustomOrder = () => {
  const [form, setForm] = useState(initialForm);
  const [referenceImage, setReferenceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    if (!form.customerName.trim() || !form.phone.trim() || !form.productType || !form.designDetails.trim()) {
      return "Name, phone, product type, and design details are required.";
    }

    if (form.budget && Number(form.budget) < 0) {
      return "Budget cannot be negative.";
    }

    return "";
  };

  const message = `Hi Go with Nonsense, I want a custom order.\nName: ${form.customerName}\nProduct: ${
    form.productType
  }\nBudget: ${form.budget ? money(form.budget) : "Not fixed"}\nDelivery date: ${
    form.deliveryDate || "Flexible"
  }\nDetails: ${form.designDetails}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (referenceImage) payload.append("referenceImage", referenceImage);

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/custom-orders", payload);
      setStatus({
        type: "success",
        message: "Your custom order request has been saved. You can also continue the discussion on WhatsApp."
      });
      setForm(initialForm);
      setReferenceImage(null);
    } catch (error) {
      setStatus({
        type: "error",
        message: `${apiMessage(error, "Could not submit custom order.")} You can still send the request on WhatsApp.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="container-page">
        <SectionHeader
          eyebrow="Custom Order"
          title="Share your idea for a personalized handmade piece"
          description="Upload a reference image, set your budget and timeline, and describe the colors, names, theme, or memory you want included."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
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
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  className="input"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+91 99999 99999"
                />
              </div>
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="productType">
                  Product Type
                </label>
                <select
                  id="productType"
                  className="input"
                  value={form.productType}
                  onChange={(event) => updateField("productType", event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="budget">
                  Budget
                </label>
                <input
                  id="budget"
                  className="input"
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={(event) => updateField("budget", event.target.value)}
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="label" htmlFor="deliveryDate">
                  Delivery Date
                </label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-3.5 text-ink/40" size={18} />
                  <input
                    id="deliveryDate"
                    className="input pl-10"
                    type="date"
                    value={form.deliveryDate}
                    onChange={(event) => updateField("deliveryDate", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="label" htmlFor="designDetails">
                Design Details
              </label>
              <textarea
                id="designDetails"
                className="input min-h-36 resize-y"
                value={form.designDetails}
                onChange={(event) => updateField("designDetails", event.target.value)}
                placeholder="Colors, theme, names, dates, flowers, glitter, size, packaging preference..."
              />
            </div>

            <div className="mt-5">
              <label className="label" htmlFor="referenceImage">
                Reference Image
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink/20 bg-cream px-4 py-8 text-center transition hover:border-gold">
                <ImagePlus className="mb-3 text-sage" size={28} />
                <span className="font-semibold">{referenceImage ? referenceImage.name : "Upload image"}</span>
                <span className="mt-1 text-sm text-ink/55">JPG, PNG, WEBP or GIF up to 5MB</span>
                <input
                  id="referenceImage"
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setReferenceImage(event.target.files?.[0] || null)}
                />
              </label>
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
                <Send size={18} />
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <a href={whatsappLink(message)} className="btn-secondary" target="_blank" rel="noreferrer">
                <MessageCircle size={18} />
                WhatsApp Details
              </a>
            </div>
          </form>

          <aside className="h-fit rounded-lg border border-ink/10 bg-mint/45 p-6">
            <h2 className="text-2xl font-black">Good details to include</h2>
            <div className="mt-5 grid gap-4 text-sm leading-6 text-ink/70">
              <p>
                <span className="font-bold text-ink">Occasion:</span> birthday, wedding, anniversary, farewell, or decor.
              </p>
              <p>
                <span className="font-bold text-ink">Style:</span> pastel, floral, glitter, gold leaf, minimal, bold, or theme-based.
              </p>
              <p>
                <span className="font-bold text-ink">Personalization:</span> names, initials, dates, photos, charms, or notes.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CustomOrder;
