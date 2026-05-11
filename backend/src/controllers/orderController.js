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

  const order = await Order.create({
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

  const allowedStatuses = ["Pending", "Confirmed", "In Progress", "Shipped", "Delivered", "Cancelled"];
  const allowedPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
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

  const order = await Order.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

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
