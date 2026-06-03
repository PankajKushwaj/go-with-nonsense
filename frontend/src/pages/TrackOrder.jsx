import { CheckCircle2, Clock, Copy, PackageCheck, RefreshCw, Search, Truck, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { apiMessage } from "../api/client.js";
import Loading from "../components/Loading.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { money, orderStatuses } from "../config/site.js";

const activeStatuses = orderStatuses.filter((status) => status !== "Cancelled");
const terminalStatuses = ["Delivered", "Cancelled"];

const publicOrderId = (order) => order?.orderNumber || order?._id || "";

const statusContent = {
  Pending: {
    icon: Clock,
    title: "Order received",
    text: "Your order request has reached the studio."
  },
  Confirmed: {
    icon: PackageCheck,
    title: "Confirmed",
    text: "The order details are confirmed."
  },
  "In Progress": {
    icon: RefreshCw,
    title: "In progress",
    text: "Your handmade piece is being prepared."
  },
  Shipped: {
    icon: Truck,
    title: "Shipped",
    text: "The order is on the way."
  },
  Delivered: {
    icon: CheckCircle2,
    title: "Delivered",
    text: "The order has been delivered."
  },
  Cancelled: {
    icon: XCircle,
    title: "Cancelled",
    text: "This order has been cancelled."
  }
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value))
    : "";

const TrackingTimeline = ({ order }) => {
  const statuses = order.orderStatus === "Cancelled" ? ["Pending", "Confirmed", "In Progress", "Cancelled"] : activeStatuses;
  const currentIndex = Math.max(statuses.indexOf(order.orderStatus), 0);
  const historyByStatus = new Map((order.statusHistory || []).map((entry) => [entry.status, entry]));

  return (
    <div className="grid gap-4">
      {statuses.map((status, index) => {
        const details = statusContent[status] || statusContent.Pending;
        const Icon = details.icon;
        const isCurrent = status === order.orderStatus;
        const isComplete = index <= currentIndex && order.orderStatus !== "Cancelled";
        const isCancelled = status === "Cancelled" && order.orderStatus === "Cancelled";
        const history = historyByStatus.get(status);

        return (
          <div key={status} className="grid grid-cols-[44px_1fr] gap-4">
            <div className="relative flex justify-center">
              <span
                className={`z-10 flex h-11 w-11 items-center justify-center rounded-full border ${
                  isCancelled
                    ? "border-red-100 bg-red-50 text-red-700"
                    : isComplete || isCurrent
                      ? "border-sage/25 bg-sage/15 text-sage"
                      : "border-ink/10 bg-white text-ink/35"
                }`}
              >
                <Icon size={19} />
              </span>
              {index < statuses.length - 1 ? <span className="absolute top-11 h-full w-px bg-ink/10" /> : null}
            </div>
            <div className="pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black">{details.title}</h3>
                {isCurrent ? <StatusPill status={status} /> : null}
              </div>
              <p className="mt-1 text-sm leading-6 text-ink/60">{details.text}</p>
              {history?.createdAt ? <p className="mt-2 text-xs font-semibold text-ink/45">{formatDate(history.createdAt)}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    orderId: searchParams.get("orderId") || "",
    contact: ""
  });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastChecked, setLastChecked] = useState("");

  const canAutoRefresh = Boolean(order && !terminalStatuses.includes(order.orderStatus));

  const latestItemText = useMemo(() => {
    if (!order?.items?.length) return "Order details";
    const firstItem = order.items[0];
    const extraCount = order.items.length - 1;
    return extraCount > 0 ? `${firstItem.name} + ${extraCount} more` : firstItem.name;
  }, [order]);

  const trackingId = publicOrderId(order);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const fetchTracking = useCallback(
    async (showLoader = true) => {
      if (!form.orderId.trim() || !form.contact.trim()) {
        setError("Order ID and phone or email are required.");
        return;
      }

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError("");

      try {
        const response = await api.post("/orders/track", {
          orderId: form.orderId.trim(),
          contact: form.contact.trim()
        });
        setOrder(response.data);
        setLastChecked(formatDate(new Date()));
      } catch (requestError) {
        if (showLoader) setOrder(null);
        setError(apiMessage(requestError, "Could not find this order."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [form.contact, form.orderId]
  );

  useEffect(() => {
    if (!canAutoRefresh) return undefined;

    const timer = window.setInterval(() => {
      fetchTracking(false);
    }, 15000);

    return () => window.clearInterval(timer);
  }, [canAutoRefresh, fetchTracking]);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchTracking(true);
  };

  const copyOrderId = async () => {
    if (!trackingId) return;

    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="container-page">
        <SectionHeader
          eyebrow="Track Order"
          title="Live product tracking for handmade orders"
          description="Check order progress from confirmation to delivery using the order ID and the phone or email used at checkout."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <form className="surface h-fit p-5 sm:p-6" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="orderId">
                Order ID
              </label>
              <input
                id="orderId"
                className="input"
                value={form.orderId}
                onChange={(event) => updateField("orderId", event.target.value)}
                placeholder="GWN-20260603-A1B2"
              />
            </div>
            <div className="mt-5">
              <label className="label" htmlFor="contact">
                Phone or Email
              </label>
              <input
                id="contact"
                className="input"
                value={form.contact}
                onChange={(event) => updateField("contact", event.target.value)}
                placeholder="Phone number or email"
              />
            </div>

            {error ? <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
              <Search size={18} />
              {loading ? "Checking..." : "Track Order"}
            </button>

            <p className="mt-5 text-sm leading-6 text-ink/55">
              The order ID is created automatically after checkout and can also be copied from the confirmation message.
            </p>
          </form>

          <section>
            {loading && !order ? <Loading label="Loading tracking details" /> : null}

            {!loading && !order ? (
              <div className="surface flex min-h-80 items-center justify-center p-8 text-center">
                <div>
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lavender/40 text-ink">
                    <PackageCheck size={26} />
                  </span>
                  <h2 className="mt-5 text-2xl font-black">Track your handmade product</h2>
                  <p className="mx-auto mt-3 max-w-md leading-7 text-ink/62">
                    Enter the order details to see the latest production, shipping, and delivery status.
                  </p>
                  <Link to="/shop" className="btn-secondary mt-6">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : null}

            {order ? (
              <div className="grid gap-6">
                <div className="surface p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-sage">{latestItemText}</p>
                      <h2 className="mt-1 text-2xl font-black sm:text-3xl">Order Tracking</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusPill status={order.orderStatus} />
                        <StatusPill status={order.paymentStatus} />
                      </div>
                    </div>
                    <button type="button" className="btn-secondary" onClick={() => fetchTracking(false)} disabled={refreshing}>
                      <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-cream p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Order ID</p>
                      <button type="button" className="mt-2 flex max-w-full items-center gap-2 text-left" onClick={copyOrderId}>
                        <span className="truncate font-mono text-sm font-bold">{trackingId}</span>
                        <Copy size={15} className="shrink-0 text-ink/45" />
                      </button>
                      {copied ? <p className="mt-1 text-xs font-semibold text-sage">Copied</p> : null}
                    </div>
                    <div className="rounded-lg bg-cream p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Total</p>
                      <p className="mt-2 text-lg font-black">{money(order.totalAmount)}</p>
                    </div>
                    <div className="rounded-lg bg-cream p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Last Checked</p>
                      <p className="mt-2 text-sm font-bold">{lastChecked || formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                  <div className="surface p-5 sm:p-6">
                    <h3 className="text-xl font-black">Progress</h3>
                    <div className="mt-6">
                      <TrackingTimeline order={order} />
                    </div>
                  </div>

                  <div className="surface p-5 sm:p-6">
                    <h3 className="text-xl font-black">Products</h3>
                    <div className="mt-5 grid gap-4">
                      {order.items?.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="flex gap-3 rounded-lg bg-cream p-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded-lg object-cover"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 font-bold">{item.name}</p>
                            <p className="mt-1 text-sm text-ink/55">Qty {item.quantity}</p>
                          </div>
                          <p className="shrink-0 text-sm font-bold">{money(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-xs font-semibold text-ink/45">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
