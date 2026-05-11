import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import CustomOrder from "../models/CustomOrder.js";
import asyncHandler from "../utils/asyncHandler.js";
import { compactString, isMongoId, isValidEmail, isValidPhone } from "../utils/validators.js";

export const createCustomOrder = asyncHandler(async (req, res) => {
  const customerName = compactString(req.body.customerName);
  const phone = compactString(req.body.phone);
  const email = compactString(req.body.email).toLowerCase();
  const productType = compactString(req.body.productType);
  const designDetails = compactString(req.body.designDetails);

  if (!customerName || !isValidPhone(phone) || !productType || !designDetails) {
    res.status(400);
    throw new Error("Name, phone, product type, and design details are required");
  }

  if (email && !isValidEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  let referenceImage = compactString(req.body.referenceImage);

  if (req.file) {
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, "go-with-nonsense/custom-orders");
    referenceImage = uploaded.secure_url;
  }

  const customOrder = await CustomOrder.create({
    customerName,
    phone,
    email,
    productType,
    designDetails,
    referenceImage,
    budget: req.body.budget ? Number(req.body.budget) : undefined,
    deliveryDate: req.body.deliveryDate || undefined
  });

  res.status(201).json(customOrder);
});

export const getCustomOrders = asyncHandler(async (_req, res) => {
  const customOrders = await CustomOrder.find().sort({ createdAt: -1 });
  res.json(customOrders);
});

export const updateCustomOrderStatus = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  const allowedStatuses = ["Pending", "Discussing", "Accepted", "In Progress", "Completed", "Cancelled"];

  if (!allowedStatuses.includes(req.body.status)) {
    res.status(400);
    throw new Error("Invalid custom order status");
  }

  const customOrder = await CustomOrder.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!customOrder) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  res.json(customOrder);
});

export const deleteCustomOrder = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  const customOrder = await CustomOrder.findByIdAndDelete(req.params.id);

  if (!customOrder) {
    res.status(404);
    throw new Error("Custom order not found");
  }

  res.json({ message: "Custom order deleted" });
});
