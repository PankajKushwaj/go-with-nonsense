import { Instagram, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import api, { apiMessage } from "../api/client.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { brand, whatsappLink } from "../config/site.js";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  message: ""
};

const Contact = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.message.trim()) {
      setStatus({ type: "error", message: "Name and message are required." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/contact", form);
      setStatus({ type: "success", message: "Message sent. We will get back to you soon." });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: `${apiMessage(error, "Could not send message.")} You can also contact us directly on WhatsApp.`
      });
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = `Hi Go with Nonsense, I need help.\nName: ${form.name}\nMessage: ${form.message}`;

  return (
    <div className="py-12 sm:py-16">
      <div className="container-page">
        <SectionHeader
          eyebrow="Contact"
          title="Questions, custom ideas, and order help"
          description="Send a message through the website or continue directly on WhatsApp for faster product and custom order conversations."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form className="rounded-lg border border-ink/10 bg-white p-5 sm:p-8" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="name">
                  Name
                </label>
                <input id="name" className="input" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
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
                <label className="label" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  className="input min-h-36 resize-y"
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                />
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
                <Send size={18} />
                {loading ? "Sending..." : "Send Message"}
              </button>
              <a href={whatsappLink(whatsappMessage)} className="btn-secondary" target="_blank" rel="noreferrer">
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>
          </form>

          <aside className="h-fit rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black">Reach the studio</h2>
            <div className="mt-6 grid gap-4 text-sm">
              <a href={whatsappLink("Hi Go with Nonsense, I need help with an order.")} className="flex items-center gap-3 rounded-lg bg-cream p-4 font-semibold" target="_blank" rel="noreferrer">
                <MessageCircle size={20} />
                WhatsApp Orders
              </a>
              <a href={brand.instagramUrl} className="flex items-center gap-3 rounded-lg bg-cream p-4 font-semibold" target="_blank" rel="noreferrer">
                <Instagram size={20} />
                Instagram
              </a>
              <a href={`mailto:${brand.email}`} className="flex items-center gap-3 rounded-lg bg-cream p-4 font-semibold">
                <Mail size={20} />
                {brand.email}
              </a>
              <p className="flex items-center gap-3 rounded-lg bg-cream p-4 font-semibold">
                <MapPin size={20} />
                Handmade in India
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Contact;
