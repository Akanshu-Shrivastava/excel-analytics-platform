import {
  createAdmin,
  getPendingAdmins,
  approveAdmin,
  rejectAdmin,
  selfDeleteAdmin,
  getAllUsersAndAdmins,
  deleteUserOrAdmin,
} from "../controllers/superAdminController.js";

import {
  getUserFilesAdmin,
  deleteUserFileAdmin,
} from "../controllers/adminFileController.js"; // <-- import file controller

import express from "express"; // ✅ This is required at the top

// Existing imports
import { protect } from "../middleware/authMiddleware.js";
import roleCheck from "../middleware/roleMiddleware.js";

  
const router = express.Router();

/* =========================
   SUPER ADMIN ROUTES
========================= */
router.post("/create-admin", protect, roleCheck("super-admin"), createAdmin);
router.get("/pending-admins", protect, roleCheck("super-admin"), getPendingAdmins);
router.put("/approve-admin/:id", protect, roleCheck("super-admin"), approveAdmin);
router.delete("/reject-admin/:id", protect, roleCheck("super-admin"), rejectAdmin);
router.delete("/self-delete/:id", protect, roleCheck("super-admin"), selfDeleteAdmin);
router.get("/all-users-admins", protect, roleCheck("super-admin"), getAllUsersAndAdmins);
router.delete("/delete/:id", protect, roleCheck("super-admin"), deleteUserOrAdmin);

/* =========================
   FILE MANAGEMENT
========================= */
router.get("/files/:userId", protect, roleCheck("super-admin"), getUserFilesAdmin); 
router.delete("/files/:userId/:fileId", protect, roleCheck("super-admin"), deleteUserFileAdmin);

export default router;
