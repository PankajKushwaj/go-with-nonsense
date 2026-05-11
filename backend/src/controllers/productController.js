import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { compactString, isMongoId, parseImages } from "../utils/validators.js";

const uploadProductImages = async (files = []) => {
  if (!files.length) return [];

  const uploadedImages = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, "go-with-nonsense/products"))
  );

  return uploadedImages.map((image) => image.secure_url);
};

const normalizeProductPayload = async (body, files, isUpdate = false) => {
  const uploadedImages = await uploadProductImages(files);
  const imageUrls = parseImages(body.images);
  const payload = {};

  const setIfPresent = (key, sourceKey, value) => {
    if (body[sourceKey] !== undefined || !isUpdate) {
      payload[key] = value;
    }
  };

  setIfPresent("name", "name", compactString(body.name));
  setIfPresent("description", "description", compactString(body.description));
  setIfPresent("category", "category", compactString(body.category));
  setIfPresent("price", "price", Number(body.price));
  setIfPresent("stock", "stock", Number(body.stock ?? 0));

  if (body.isFeatured !== undefined || !isUpdate) {
    payload.isFeatured = body.isFeatured === true || body.isFeatured === "true";
  }

  if (body.images !== undefined || uploadedImages.length) {
    payload.images = [...imageUrls, ...uploadedImages];
  }

  return payload;
};

export const createProduct = asyncHandler(async (req, res) => {
  const payload = await normalizeProductPayload(req.body, req.files || []);

  if (!payload.name || !payload.description || !payload.category || Number.isNaN(payload.price)) {
    res.status(400);
    throw new Error("Name, description, price, and category are required");
  }

  const product = await Product.create(payload);
  res.status(201).json(product);
});

export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, featured } = req.query;
  const query = {};

  if (category && category !== "All") {
    query.category = category;
  }

  if (featured === "true") {
    query.isFeatured = true;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found");
  }

  const payload = await normalizeProductPayload(req.body, req.files || [], true);
  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!isMongoId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found");
  }

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ message: "Product deleted" });
});
