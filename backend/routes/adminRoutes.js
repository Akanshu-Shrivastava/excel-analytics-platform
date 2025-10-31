// backend/routes/adminRoutes.js
import express from "express";
import {
  getAllUsersForAdmin,
  deleteUserByAdmin,
  getUserFilesAdmin,
  deleteUserFileAdmin,
  createUser,
} from "../controllers/adminController.js";
import { protect,authorize } from "../middleware/authMiddleware.js";
import roleCheck from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =========================
   USER & ADMIN MANAGEMENT (Admin Only)
========================= */
router.get("/manage-users", protect, roleCheck("admin", "super-admin"), getAllUsersForAdmin);
router.delete("/manage-users/:id", protect, roleCheck("admin", "super-admin"), deleteUserByAdmin);

/* =========================
   FILE MANAGEMENT (Admin Only)
========================= */
router.get("/files/:userId", protect, roleCheck("admin", "super-admin"), getUserFilesAdmin);
router.delete("/files/:userId/:fileId", protect, roleCheck("admin", "super-admin"), deleteUserFileAdmin);



// Super Admin → can create admins & users
router.post("/create", protect, authorize("super-admin", "admin"), createUser);

export default router;
