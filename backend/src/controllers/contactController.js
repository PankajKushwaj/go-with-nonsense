import ContactMessage from "../models/ContactMessage.js";
import asyncHandler from "../utils/asyncHandler.js";
import { compactString, isMongoId, isValidEmail, isValidPhone } from "../utils/validators.js";

export const createContactMessage = asyncHandler(async (req, res) => {
  const name = compactString(req.body.name);
  const email = compactString(req.body.email).toLowerCase();
  const phone = compactString(req.body.phone);
  const message = compactString(req.body.message);

  if (!name || !message) {
    res.status(400);
    throw new Error("Name and message are required");
  }

  if (email && !isValidEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  if (phone && !isValidPhone(phone)) {
    res.status(400);
    throw new Error("Please enter a valid phone number");
  }

  const contactMessage = await ContactMessage.create({ name, email, phone, message });
  res.status(201).json(contactMessage);
});

export const getContactMessages = asyncHandler(async (_req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Message not found");
  }

  const message = await ContactMessage.findByIdAndDelete(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  res.json({ message: "Contact message deleted" });
});
