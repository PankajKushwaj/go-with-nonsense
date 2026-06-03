import express from "express";
import {
  getCurrentAdmin,
  getCurrentCustomer,
  getCustomerOrders,
  loginAdmin,
  loginCustomer,
  registerCustomer
} from "../controllers/authController.js";
import { adminOnly, customerOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", protect, adminOnly, getCurrentAdmin);
router.post("/customer/register", registerCustomer);
router.post("/customer/login", loginCustomer);
router.get("/customer/me", protect, customerOnly, getCurrentCustomer);
router.get("/customer/orders", protect, customerOnly, getCustomerOrders);

export default router;
