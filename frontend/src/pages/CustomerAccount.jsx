import { Copy, LogOut, PackageCheck, RefreshCw, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { apiMessage } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { money } from "../config/site.js";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const publicOrderId = (order) => order?.orderNumber || order?._id || "";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value))
    : "-";

const CustomerAccount = () => {
  const { user, logout } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const activeOrders = useMemo(
    () => orders.filter((order) => !["Delivered", "Cancelled"].includes(order.orderStatus)).length,
    [orders]
  );

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/auth/customer/orders");
      setOrders(response.data);
    } catch (requestError) {
      setError(apiMessage(requestError, "Could not load your orders."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(orderId);
      window.setTimeout(() => setCopiedId(""), 1800);
    } catch {
      setCopiedId("");
    }
  };

  return (
    <div className="py-10 sm:py-14">
      <div className="container-page">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="My Account"
            title={`Hello, ${user?.name || "Customer"}`}
            description="View your handmade orders, copy order IDs, and open realtime tracking whenever you need."
          />
          <button type="button" className="btn-secondary" onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="surface p-5">
            <p className="text-sm font-semibold text-ink/55">Email</p>
            <p className="mt-2 break-all font-bold">{user?.email}</p>
          </div>
          <div className="surface p-5">
            <p className="text-sm font-semibold text-ink/55">Phone</p>
            <p className="mt-2 font-bold">{user?.phone || "-"}</p>
          </div>
          <div className="surface p-5">
            <p className="text-sm font-semibold text-ink/55">Active Orders</p>
            <p className="mt-2 text-3xl font-black">{activeOrders}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">My Orders</h2>
            <p className="mt-1 text-sm text-ink/55">Orders are matched using your account, email, or phone number.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={loadOrders} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error ? <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <Loading label="Loading your orders" /> : null}

        {!loading && !orders.length ? (
          <EmptyState
            title="No orders in your account yet"
            message="Place an order while logged in, or use the track order page with your order ID."
            action={
              <Link to="/shop" className="btn-primary">
                Shop Products
              </Link>
            }
          />
        ) : null}

        {!loading && orders.length ? (
          <div className="mt-5 grid gap-5">
            {orders.map((order) => {
              const orderId = publicOrderId(order);
              const firstItem = order.items?.[0];
              return (
                <article key={order._id} className="surface p-5">
                  <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={order.orderStatus} />
                        <StatusPill status={order.paymentStatus} />
                      </div>
                      <div className="mt-4 flex gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-lavender/30 text-ink">
                          <PackageCheck size={24} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-xl font-black">{firstItem?.name || "Handmade order"}</h3>
                          <p className="mt-1 text-sm text-ink/55">
                            {order.items?.length || 0} item(s) - Placed {formatDate(order.createdAt)}
                          </p>
                          <button type="button" className="mt-2 flex max-w-full items-center gap-2" onClick={() => copyOrderId(orderId)}>
                            <span className="truncate font-mono text-sm font-bold text-ink/60">{orderId}</span>
                            <Copy size={15} className="shrink-0 text-ink/40" />
                          </button>
                          {copiedId === orderId ? <p className="mt-1 text-xs font-semibold text-sage">Order ID copied</p> : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 lg:items-end">
                      <p className="text-2xl font-black">{money(order.totalAmount)}</p>
                      <Link to={`/track-order?orderId=${encodeURIComponent(orderId)}`} className="btn-primary">
                        Track Order
                      </Link>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2">
                    {order.items?.map((item, index) => (
                      <p key={`${order._id}-${index}`} className="rounded-lg bg-cream px-3 py-2 text-sm text-ink/70">
                        {item.quantity} x {item.name} - {money(item.price * item.quantity)}
                      </p>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        <div className="mt-10 rounded-lg border border-ink/10 bg-mint/40 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Ready for another handmade piece?</h2>
              <p className="mt-1 text-sm text-ink/60">Your account keeps tracking simple for every future order.</p>
            </div>
            <Link to="/shop" className="btn-secondary">
              <ShoppingBag size={18} />
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccount;
