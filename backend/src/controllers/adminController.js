import ContactMessage from "../models/ContactMessage.js";
import CustomOrder from "../models/CustomOrder.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalProducts, totalOrders, totalCustomers, pendingOrders, pendingCustomOrders, unreadMessages, revenueResult] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.countDocuments({ orderStatus: { $in: ["Pending", "Confirmed", "In Progress"] } }),
      CustomOrder.countDocuments({ status: { $in: ["Pending", "Discussing", "Accepted", "In Progress"] } }),
      ContactMessage.countDocuments(),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid"
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" }
          }
        }
      ])
    ]);

  res.json({
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue: revenueResult[0]?.revenue || 0,
    pendingOrders,
    pendingCustomOrders,
    contactMessages: unreadMessages
  });
});

const normalizePhoneDigits = (value = "") => String(value || "").replace(/\D/g, "");

const orderBelongsToCustomer = (order, customer) => {
  if (order.customer && String(order.customer) === String(customer._id)) return true;
  if (order.email && customer.email && order.email.toLowerCase() === customer.email.toLowerCase()) return true;

  const orderPhone = normalizePhoneDigits(order.phone);
  const customerPhone = normalizePhoneDigits(customer.phone);

  return Boolean(orderPhone && customerPhone && (orderPhone === customerPhone || orderPhone.endsWith(customerPhone)));
};

const publicOrderId = (order) => order.orderNumber || String(order._id);

export const getCustomers = asyncHandler(async (_req, res) => {
  const [customers, orders] = await Promise.all([
    User.find({ role: "customer" }).select("-password").sort({ createdAt: -1 }).lean(),
    Order.find().sort({ createdAt: -1 }).lean()
  ]);

  const customerDetails = customers.map((customer) => {
    const customerOrders = orders.filter((order) => orderBelongsToCustomer(order, customer));
    const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const paidAmount = customerOrders
      .filter((order) => order.paymentStatus === "Paid")
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const activeOrders = customerOrders.filter((order) => !["Delivered", "Cancelled"].includes(order.orderStatus)).length;

    return {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      role: customer.role,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      orderCount: customerOrders.length,
      activeOrders,
      totalSpent,
      paidAmount,
      latestOrderAt: customerOrders[0]?.createdAt || null,
      latestAddress: customerOrders[0]?.address || "",
      recentOrders: customerOrders.slice(0, 5).map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        publicId: publicOrderId(order),
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        items: order.items || []
      }))
    };
  });

  res.json(customerDetails);
});
