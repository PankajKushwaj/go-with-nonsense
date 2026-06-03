import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  trackOrder,
  updateOrderStatus
} from "../controllers/orderController.js";
import { adminOnly, optionalAuth, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(optionalAuth, createOrder).get(protect, adminOnly, getOrders);
router.post("/track", trackOrder);
router
  .route("/:id")
  .get(protect, adminOnly, getOrderById)
  .patch(protect, adminOnly, updateOrderStatus)
  .delete(protect, adminOnly, deleteOrder);

export default router;
