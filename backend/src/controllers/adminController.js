import ContactMessage from "../models/ContactMessage.js";
import CustomOrder from "../models/CustomOrder.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalProducts, totalOrders, pendingOrders, pendingCustomOrders, unreadMessages, revenueResult] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
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
    totalRevenue: revenueResult[0]?.revenue || 0,
    pendingOrders,
    pendingCustomOrders,
    contactMessages: unreadMessages
  });
});
