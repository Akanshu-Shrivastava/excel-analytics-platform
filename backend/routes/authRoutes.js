// backend/routes/authRoutes.js
import express from "express";
import {
  signup,
  login,
  getMe,
  deleteMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Signup
router.post("/signup", signup);

// ✅ Login
router.post("/login", login);

// ✅ Get current user (protected)
router.get("/me", protect, getMe);

// ✅ Delete own account (used for unapproved admin timeout or rejection)
router.delete("/me", protect, deleteMe);

export default router;
