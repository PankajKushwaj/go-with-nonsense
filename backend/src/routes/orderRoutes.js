import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(createOrder).get(protect, adminOnly, getOrders);
router
  .route("/:id")
  .get(protect, adminOnly, getOrderById)
  .patch(protect, adminOnly, updateOrderStatus)
  .delete(protect, adminOnly, deleteOrder);

export default router;
