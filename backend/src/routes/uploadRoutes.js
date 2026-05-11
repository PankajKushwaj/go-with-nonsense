import express from "express";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("Image file is required");
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, "go-with-nonsense/uploads");
    res.json({
      success: true,
      imageUrl: result.secure_url
    });
  })
);

export default router;
