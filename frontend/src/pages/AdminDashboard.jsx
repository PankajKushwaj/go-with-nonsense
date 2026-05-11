import {
  BarChart3,
  Box,
  ClipboardList,
  LogOut,
  Mail,
  MessageSquareText,
  PackagePlus,
  RefreshCw,
  Save,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api, { apiMessage } from "../api/client.js";
import Loading from "../components/Loading.jsx";
import StatusPill from "../components/StatusPill.jsx";
import {
  categories,
  customOrderStatuses,
  money,
  orderStatuses,
  paymentStatuses
} from "../config/site.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  category: categories[0],
  stock: "",
  isFeatured: false,
  imagesText: ""
};

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Box },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "custom", label: "Custom Orders", icon: MessageSquareText },
  { id: "messages", label: "Messages", icon: Mail }
];

const shortDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value))
    : "-";

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productFiles, setProductFiles] = useState([]);

  const loadDashboard = async () => {
    setLoading(true);
    setNotice({ type: "", message: "" });

    try {
      const [statsResponse, productsResponse, ordersResponse, customResponse, messagesResponse] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/products"),
        api.get("/orders"),
        api.get("/custom-orders"),
        api.get("/contact")
      ]);

      setStats(statsResponse.data);
      setProducts(productsResponse.data);
      setOrders(ordersResponse.data);
      setCustomOrders(customResponse.data);
      setMessages(messagesResponse.data);
    } catch (error) {
      setNotice({ type: "error", message: apiMessage(error, "Could not load dashboard data.") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const topProducts = useMemo(() => products.slice(0, 5), [products]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const updateProductForm = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductFiles([]);
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || categories[0],
      stock: product.stock ?? "",
      isFeatured: Boolean(product.isFeatured),
      imagesText: product.images?.join("\n") || ""
    });
    setActiveTab("products");
  };

  const productPayload = () => {
    const formData = new FormData();
    formData.append("name", productForm.name);
    formData.append("description", productForm.description);
    formData.append("price", productForm.price);
    formData.append("category", productForm.category);
    formData.append("stock", productForm.stock || 0);
    formData.append("isFeatured", productForm.isFeatured);
    formData.append(
      "images",
      JSON.stringify(
        productForm.imagesText
          .split(/\r?\n/)
          .map((image) => image.trim())
          .filter(Boolean)
      )
    );
    productFiles.forEach((file) => formData.append("images", file));
    return formData;
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    if (!productForm.name.trim() || !productForm.description.trim() || !productForm.price || !productForm.category) {
      setNotice({ type: "error", message: "Product name, description, price, and category are required." });
      return;
    }

    try {
      if (editingProduct) {
        const response = await api.patch(`/products/${editingProduct._id}`, productPayload());
        setProducts((current) => current.map((product) => (product._id === response.data._id ? response.data : product)));
        setNotice({ type: "success", message: "Product updated." });
      } else {
        const response = await api.post("/products", productPayload());
        setProducts((current) => [response.data, ...current]);
        setNotice({ type: "success", message: "Product added." });
      }
      resetProductForm();
    } catch (error) {
      setNotice({ type: "error", message: apiMessage(error, "Could not save product.") });
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${productId}`);
      setProducts((current) => current.filter((product) => product._id !== productId));
      setNotice({ type: "success", message: "Product deleted." });
    } catch (error) {
      setNotice({ type: "error", message: apiMessage(error, "Could not delete product.") });
    }
  };

  const updateOrder = async (orderId, field, value) => {
    try {
      const response = await api.patch(`/orders/${orderId}`, { [field]: value });
      setOrders((current) => current.map((order) => (order._id === orderId ? response.data : order)));
      setNotice({ type: "success", message: "Order updated." });
    } catch (error) {
      setNotice({ type: "error", message: apiMessage(error, "Could not update order.") });
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await api.delete(`/orders/${orderId}`);
      setOrders((current) => current.filter((order) => order._id !== orderId));
      setNotice({ type: "success", message: "Order deleted." });
    } catch (error) {
      setNotice({ type: "error", message: apiMessage(error, "Could not delete order.") });
    }
  };

  const updateCustomOrder = async (customOrderId, status) => {
    try {
      const response = await api.patch(`/custom-orders/${customOrderId}`, { status });
      setCustomOrders((current) => current.map((order) => (order._id === customOrderId ? response.data : order)));
      setNotice({ type: "success", message: "Custom order updated." });
    } catch (error) {
      setNotice({ type: "error", message: apiMessage(error, "Could not update custom order.") });
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await api.delete(`/contact/${messageId}`);
      setMessages((current) => current.filter((message) => message._id !== messageId));
      setNotice({ type: "success", message: "Message deleted." });
    } catch (error) {
      setNotice({ type: "error", message: apiMessage(error, "Could not delete message.") });
    }
  };

  return (
    <div className="py-8 sm:py-10">
      <div className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sage">Admin Dashboard</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">Welcome, {user?.name || "Admin"}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={loadDashboard}>
              <RefreshCw size={18} />
              Refresh
            </button>
            <button type="button" className="btn-primary" onClick={logout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {notice.message ? (
          <p
            className={`mt-6 rounded-lg px-4 py-3 text-sm font-semibold ${
              notice.type === "success" ? "bg-sage/15 text-sage" : "bg-red-50 text-red-700"
            }`}
          >
            {notice.message}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-lg border border-ink/10 bg-white p-3">
            <div className="grid gap-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition ${
                    activeTab === id ? "bg-ink text-cream" : "text-ink/65 hover:bg-cream hover:text-ink"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          <section>
            {loading ? <Loading label="Loading dashboard" /> : null}

            {!loading && activeTab === "overview" ? (
              <div className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Total Products", stats?.totalProducts || 0],
                    ["Total Orders", stats?.totalOrders || 0],
                    ["Total Revenue", money(stats?.totalRevenue || 0)],
                    ["Pending Orders", stats?.pendingOrders || 0]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                      <p className="text-sm font-semibold text-ink/55">{label}</p>
                      <p className="mt-3 text-3xl font-black">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-lg border border-ink/10 bg-white p-5">
                    <h2 className="text-xl font-black">Recent Orders</h2>
                    <div className="mt-4 grid gap-3">
                      {recentOrders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between gap-3 rounded-lg bg-cream p-3">
                          <div>
                            <p className="font-bold">{order.customerName}</p>
                            <p className="text-sm text-ink/55">{money(order.totalAmount)} - {shortDate(order.createdAt)}</p>
                          </div>
                          <StatusPill status={order.orderStatus} />
                        </div>
                      ))}
                      {!recentOrders.length ? <p className="text-sm text-ink/55">No orders yet.</p> : null}
                    </div>
                  </div>

                  <div className="rounded-lg border border-ink/10 bg-white p-5">
                    <h2 className="text-xl font-black">Latest Products</h2>
                    <div className="mt-4 grid gap-3">
                      {topProducts.map((product) => (
                        <div key={product._id} className="flex items-center gap-3 rounded-lg bg-cream p-3">
                          <img src={product.images?.[0]} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="font-bold">{product.name}</p>
                            <p className="text-sm text-ink/55">{product.category}</p>
                          </div>
                          <p className="font-bold">{money(product.price)}</p>
                        </div>
                      ))}
                      {!topProducts.length ? <p className="text-sm text-ink/55">No products yet.</p> : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && activeTab === "products" ? (
              <div className="grid gap-6">
                <form className="rounded-lg border border-ink/10 bg-white p-5" onSubmit={handleProductSubmit}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blush/50">
                      <PackagePlus size={20} />
                    </span>
                    <div>
                      <h2 className="text-xl font-black">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                      <p className="text-sm text-ink/55">Upload Cloudinary images or paste image URLs.</p>
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="productName">
                        Name
                      </label>
                      <input id="productName" className="input" value={productForm.name} onChange={(event) => updateProductForm("name", event.target.value)} />
                    </div>
                    <div>
                      <label className="label" htmlFor="productCategory">
                        Category
                      </label>
                      <select
                        id="productCategory"
                        className="input"
                        value={productForm.category}
                        onChange={(event) => updateProductForm("category", event.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label" htmlFor="price">
                        Price
                      </label>
                      <input
                        id="price"
                        className="input"
                        type="number"
                        min="0"
                        value={productForm.price}
                        onChange={(event) => updateProductForm("price", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="stock">
                        Stock
                      </label>
                      <input
                        id="stock"
                        className="input"
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(event) => updateProductForm("stock", event.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="description"
                        className="input min-h-28 resize-y"
                        value={productForm.description}
                        onChange={(event) => updateProductForm("description", event.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="imagesText">
                        Image URLs
                      </label>
                      <textarea
                        id="imagesText"
                        className="input min-h-24 resize-y"
                        value={productForm.imagesText}
                        onChange={(event) => updateProductForm("imagesText", event.target.value)}
                        placeholder="One image URL per line"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="productFiles">
                        Upload Images
                      </label>
                      <input
                        id="productFiles"
                        className="input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) => setProductFiles(Array.from(event.target.files || []))}
                      />
                    </div>
                    <label className="flex items-center gap-3 rounded-lg bg-cream px-4 py-3 text-sm font-bold">
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(event) => updateProductForm("isFeatured", event.target.checked)}
                      />
                      Featured product
                    </label>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="submit" className="btn-primary">
                      <Save size={18} />
                      {editingProduct ? "Update Product" : "Add Product"}
                    </button>
                    {editingProduct ? (
                      <button type="button" className="btn-secondary" onClick={resetProductForm}>
                        Cancel Edit
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-ink/10 text-sm">
                      <thead className="bg-cream text-left">
                        <tr>
                          <th className="px-4 py-3 font-bold">Product</th>
                          <th className="px-4 py-3 font-bold">Category</th>
                          <th className="px-4 py-3 font-bold">Price</th>
                          <th className="px-4 py-3 font-bold">Stock</th>
                          <th className="px-4 py-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={product.images?.[0]} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                                <span className="font-bold">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{product.category}</td>
                            <td className="px-4 py-3 font-bold">{money(product.price)}</td>
                            <td className="px-4 py-3">{product.stock}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button type="button" className="btn-secondary px-3 py-2" onClick={() => editProduct(product)}>
                                  Edit
                                </button>
                                <button type="button" className="icon-btn" onClick={() => deleteProduct(product._id)} title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && activeTab === "orders" ? (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <article key={order._id} className="rounded-lg border border-ink/10 bg-white p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-black">{order.customerName}</h2>
                          <StatusPill status={order.orderStatus} />
                          <StatusPill status={order.paymentStatus} />
                        </div>
                        <p className="mt-2 text-sm text-ink/55">{order.phone} - {order.email || "No email"} - {shortDate(order.createdAt)}</p>
                        <p className="mt-2 text-sm text-ink/70">{order.address}</p>
                      </div>
                      <p className="text-2xl font-black">{money(order.totalAmount)}</p>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm">
                      {order.items?.map((item, index) => (
                        <p key={`${order._id}-${index}`} className="rounded-lg bg-cream px-3 py-2">
                          {item.quantity} x {item.name} - {money(item.price * item.quantity)}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <select className="input" value={order.orderStatus} onChange={(event) => updateOrder(order._id, "orderStatus", event.target.value)}>
                        {orderStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                      <select
                        className="input"
                        value={order.paymentStatus}
                        onChange={(event) => updateOrder(order._id, "paymentStatus", event.target.value)}
                      >
                        {paymentStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                      <button type="button" className="icon-btn" onClick={() => deleteOrder(order._id)} title="Delete order">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
                {!orders.length ? <p className="rounded-lg bg-white p-5 text-sm text-ink/55">No orders yet.</p> : null}
              </div>
            ) : null}

            {!loading && activeTab === "custom" ? (
              <div className="grid gap-4">
                {customOrders.map((order) => (
                  <article key={order._id} className="rounded-lg border border-ink/10 bg-white p-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-black">{order.customerName}</h2>
                          <StatusPill status={order.status} />
                        </div>
                        <p className="mt-2 text-sm text-ink/55">{order.phone} - {order.email || "No email"} - {shortDate(order.createdAt)}</p>
                        <p className="mt-3 font-bold">{order.productType}</p>
                        <p className="mt-2 leading-7 text-ink/70">{order.designDetails}</p>
                        <p className="mt-2 text-sm text-ink/60">
                          Budget: {order.budget ? money(order.budget) : "Flexible"} - Delivery:{" "}
                          {order.deliveryDate ? shortDate(order.deliveryDate) : "Flexible"}
                        </p>
                      </div>
                      {order.referenceImage ? (
                        <img src={order.referenceImage} alt="Custom order reference" className="h-44 w-full rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-44 items-center justify-center rounded-lg bg-cream text-sm font-semibold text-ink/45">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-4 max-w-sm">
                      <select className="input" value={order.status} onChange={(event) => updateCustomOrder(order._id, event.target.value)}>
                        {customOrderStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
                {!customOrders.length ? <p className="rounded-lg bg-white p-5 text-sm text-ink/55">No custom orders yet.</p> : null}
              </div>
            ) : null}

            {!loading && activeTab === "messages" ? (
              <div className="grid gap-4">
                {messages.map((message) => (
                  <article key={message._id} className="rounded-lg border border-ink/10 bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-black">{message.name}</h2>
                        <p className="mt-2 text-sm text-ink/55">{message.phone || "No phone"} - {message.email || "No email"} - {shortDate(message.createdAt)}</p>
                        <p className="mt-3 leading-7 text-ink/70">{message.message}</p>
                      </div>
                      <button type="button" className="icon-btn" onClick={() => deleteMessage(message._id)} title="Delete message">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
                {!messages.length ? <p className="rounded-lg bg-white p-5 text-sm text-ink/55">No contact messages yet.</p> : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
