import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isMongoId } from "../utils/validators.js";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay is not configured");
    error.statusCode = 503;
    throw error;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const orderId = req.body.orderId;

  if (Number.isNaN(amount) || amount <= 0) {
    res.status(400);
    throw new Error("A valid amount is required");
  }

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `gwn_${Date.now()}`,
    notes: {
      orderId: orderId || ""
    }
  });

  if (isMongoId(orderId)) {
    await Order.findByIdAndUpdate(orderId, {
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      "paymentInfo.razorpayOrderId": razorpayOrder.id
    });
  }

  res.status(201).json(razorpayOrder);
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Razorpay payment details are required");
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    res.status(503);
    throw new Error("Razorpay is not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed");
  }

  let order = null;

  if (isMongoId(orderId)) {
    order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "Paid",
        paymentMethod: "Razorpay",
        "paymentInfo.razorpayOrderId": razorpay_order_id,
        "paymentInfo.razorpayPaymentId": razorpay_payment_id,
        "paymentInfo.razorpaySignature": razorpay_signature
      },
      { new: true }
    );
  }

  res.json({
    verified: true,
    order
  });
});
