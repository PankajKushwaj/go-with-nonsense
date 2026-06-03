import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { compactString, isValidEmail, isValidPhone } from "../utils/validators.js";

const createToken = (id) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured");
    error.statusCode = 503;
    throw error;
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const email = compactString(req.body.email).toLowerCase();
  const password = String(req.body.password || "");

  if (!isValidEmail(email) || !password) {
    res.status(400);
    throw new Error("Valid email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user || user.role !== "admin" || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid admin credentials");
  }

  res.json({
    user: userPayload(user),
    token: createToken(user._id)
  });
});

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.json({ user: userPayload(req.user) });
});

export const registerCustomer = asyncHandler(async (req, res) => {
  const name = compactString(req.body.name);
  const email = compactString(req.body.email).toLowerCase();
  const phone = compactString(req.body.phone);
  const password = String(req.body.password || "");

  if (!name || !isValidEmail(email) || !isValidPhone(phone) || password.length < 8) {
    res.status(400);
    throw new Error("Name, valid email, phone, and password of at least 8 characters are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("An account already exists with this email");
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: "customer"
  });

  res.status(201).json({
    user: userPayload(user),
    token: createToken(user._id)
  });
});

export const loginCustomer = asyncHandler(async (req, res) => {
  const email = compactString(req.body.email).toLowerCase();
  const password = String(req.body.password || "");

  if (!isValidEmail(email) || !password) {
    res.status(400);
    throw new Error("Valid email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user || user.role !== "customer" || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid customer credentials");
  }

  res.json({
    user: userPayload(user),
    token: createToken(user._id)
  });
});

export const getCurrentCustomer = asyncHandler(async (req, res) => {
  res.json({ user: userPayload(req.user) });
});

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const phoneDigits = compactString(req.user.phone).replace(/\D/g, "");
  const query = {
    $or: [{ customer: req.user._id }, { email: req.user.email }]
  };

  if (phoneDigits) {
    query.$or.push({ phone: { $regex: `${phoneDigits}$` } });
  }

  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json(orders);
});
