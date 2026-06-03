import express from "express";
import { getCustomers, getDashboardStats } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/customers", protect, adminOnly, getCustomers);

export default router;
