import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { compactString, isValidEmail } from "../utils/validators.js";

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
