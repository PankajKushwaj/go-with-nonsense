import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import { compactString, isMongoId, isValidEmail, isValidPhone } from "../utils/validators.js";

const normalizeOrderItems = (items = []) =>
  items.map((item) => ({
    product: isMongoId(item.product || item._id) ? item.product || item._id : undefined,
    name: compactString(item.name),
    image: item.image || item.images?.[0] || "",
    price: Number(item.price),
    quantity: Number(item.quantity || item.qty || 1)
  }));

const allowedStatuses = ["Pending", "Confirmed", "In Progress", "Shipped", "Delivered", "Cancelled"];
const allowedPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];

const normalizePhoneDigits = (value = "") => compactString(value).replace(/\D/g, "");

const createOrderNumber = () => {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GWN-${datePart}-${randomPart}`;
};

const generateUniqueOrderNumber = async () => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const orderNumber = createOrderNumber();
    const exists = await Order.exists({ orderNumber });
    if (!exists) return orderNumber;
  }

  throw new Error("Could not generate a unique order ID");
};

const createOrderWithNumber = async (payload) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = await generateUniqueOrderNumber();

    try {
      return await Order.create({ ...payload, orderNumber });
    } catch (error) {
      if (error?.code !== 11000 || !error?.keyValue?.orderNumber) {
        throw error;
      }
    }
  }

  throw new Error("Could not create a unique order ID");
};

const findOrderByPublicId = async (value = "") => {
  const cleanValue = compactString(value);
  if (!cleanValue) return null;

  if (isMongoId(cleanValue)) {
    return Order.findOne({
      $or: [{ _id: cleanValue }, { orderNumber: cleanValue.toUpperCase() }]
    });
  }

  return Order.findOne({ orderNumber: cleanValue.toUpperCase() });
};

const contactMatchesOrder = (order, contact = "") => {
  const cleanContact = compactString(contact).toLowerCase();
  if (!cleanContact) return false;

  if (cleanContact.includes("@")) {
    return Boolean(order.email && order.email.toLowerCase() === cleanContact);
  }

  const inputDigits = normalizePhoneDigits(cleanContact);
  const orderDigits = normalizePhoneDigits(order.phone);
  if (!inputDigits || !orderDigits) return false;

  return orderDigits === inputDigits || orderDigits.endsWith(inputDigits) || inputDigits.endsWith(orderDigits);
};

const safeTrackingPayload = (order) => ({
  _id: order._id,
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  items: order.items,
  totalAmount: order.totalAmount,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  orderStatus: order.orderStatus,
  statusHistory: order.statusHistory?.length
    ? order.statusHistory
    : [{ status: order.orderStatus || "Pending", note: "Current order status", createdAt: order.createdAt }],
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

export const createOrder = asyncHandler(async (req, res) => {
  const customerName = compactString(req.body.customerName);
  const phone = compactString(req.body.phone);
  const email = compactString(req.body.email).toLowerCase();
  const address = compactString(req.body.address);
  const paymentMethod = req.body.paymentMethod || "WhatsApp";
  const items = normalizeOrderItems(req.body.items);

  if (!customerName || !isValidPhone(phone) || !address || !items.length) {
    res.status(400);
    throw new Error("Name, phone, address, and at least one order item are required");
  }

  if (email && !isValidEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  const hasInvalidItems = items.some(
    (item) => !item.name || Number.isNaN(item.price) || item.price < 0 || item.quantity < 1
  );

  if (hasInvalidItems) {
    res.status(400);
    throw new Error("Order items contain invalid values");
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await createOrderWithNumber({
    customerName,
    phone,
    email,
    address,
    items,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" || paymentMethod === "WhatsApp" ? "Pending" : "Pending"
  });

  res.status(201).json(order);
});

export const trackOrder = asyncHandler(async (req, res) => {
  const orderId = compactString(req.body.orderId || req.body.id);
  const contact = compactString(req.body.contact || req.body.phone || req.body.email);

  if (!orderId || !contact) {
    res.status(400);
    throw new Error("Order ID and phone or email are required");
  }

  const order = await findOrderByPublicId(orderId);

  if (!order || !contactMatchesOrder(order, contact)) {
    res.status(404);
    throw new Error("Order not found for these details");
  }

  res.json(safeTrackingPayload(order));
});

export const getOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Order not found");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Order not found");
  }

  const updates = {};

  if (req.body.orderStatus) {
    if (!allowedStatuses.includes(req.body.orderStatus)) {
      res.status(400);
      throw new Error("Invalid order status");
    }
    updates.orderStatus = req.body.orderStatus;
  }

  if (req.body.paymentStatus) {
    if (!allowedPaymentStatuses.includes(req.body.paymentStatus)) {
      res.status(400);
      throw new Error("Invalid payment status");
    }
    updates.paymentStatus = req.body.paymentStatus;
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const statusChanged = Boolean(updates.orderStatus && updates.orderStatus !== order.orderStatus);
  Object.assign(order, updates);

  if (statusChanged) {
    order.statusHistory.push({
      status: updates.orderStatus,
      note: `Order marked ${updates.orderStatus}`
    });
  }

  await order.save();

  res.json(order);
});

export const deleteOrder = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Order not found");
  }

  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({ message: "Order deleted" });
});
