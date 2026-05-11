import express from "express";
import {
  createCustomOrder,
  deleteCustomOrder,
  getCustomOrders,
  updateCustomOrderStatus
} from "../controllers/customOrderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";


const router = express.Router();

router.route("/").post(upload.single("referenceImage"), createCustomOrder).get(protect, adminOnly, getCustomOrders);
router
  .route("/:id")
  .patch(protect, adminOnly, updateCustomOrderStatus)
  .delete(protect, adminOnly, deleteCustomOrder);

export default router;
