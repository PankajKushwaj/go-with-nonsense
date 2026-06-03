import { LogIn, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiMessage } from "../api/client.js";
import { brand } from "../config/site.js";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: ""
};

const CustomerLogin = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register, isCustomerAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
      navigate(location.state?.from || "/account", { replace: true });
    } catch (requestError) {
      setError(apiMessage(requestError, mode === "register" ? "Could not create account." : "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  if (isCustomerAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-160px)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <div
          className="hidden bg-cover bg-center p-8 lg:flex lg:flex-col lg:justify-end"
          style={{
            backgroundImage:
              "linear-gradient(0deg, rgba(24,21,19,0.72), rgba(24,21,19,0.12)), url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1100&q=85')"
          }}
        >
          <div className="text-cream">
            <p className="inline-flex items-center gap-2 rounded-full bg-cream/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles size={16} />
              Customer account
            </p>
            <h1 className="mt-5 text-4xl font-black">{brand.name}</h1>
            <p className="mt-3 max-w-sm leading-7 text-cream/78">
              Sign in to view your handmade orders, copy tracking IDs, and follow every product from confirmation to
              delivery.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-sage">Customer Panel</p>
            <h2 className="mt-2 text-3xl font-black">{mode === "login" ? "Customer Login" : "Create Account"}</h2>
            <p className="mt-2 text-sm text-ink/60">Track orders and keep your details ready for checkout.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg bg-cream p-1">
            {[
              ["login", "Sign In"],
              ["register", "Register"]
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  setError("");
                }}
                className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                  mode === id ? "bg-ink text-cream shadow-sm" : "text-ink/60 hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <>
                <div>
                  <label className="label" htmlFor="customerName">
                    Full Name
                  </label>
                  <input
                    id="customerName"
                    className="input"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="customerPhone">
                    Phone
                  </label>
                  <input
                    id="customerPhone"
                    className="input"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    required
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="label" htmlFor="customerEmail">
                Email
              </label>
              <input
                id="customerEmail"
                type="email"
                className="input"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="customerPassword">
                Password
              </label>
              <input
                id="customerPassword"
                type="password"
                className="input"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                minLength={8}
                required
              />
            </div>

            {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {mode === "register" ? <UserPlus size={18} /> : <LogIn size={18} />}
              {loading ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/55">
            Admin access remains separate at <span className="font-bold text-ink">/login</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
