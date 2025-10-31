// backend/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadExcel,
  getUploadHistory,
  downloadExcelFile,
  getParsedFileById,
  deleteFile,
  getFilesByUserForAdmin,
  deleteFileByAdmin,
  generateAISummary,
} from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import roleCheck from "../middleware/roleMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// USER ROUTES
router.post("/upload", protect, upload.single("file"), uploadExcel);
router.get("/history", protect, getUploadHistory);
router.get("/download/:id", protect, downloadExcelFile);
router.get("/parsed/:id", protect, getParsedFileById);
router.delete("/:id", protect, deleteFile);
router.post("/summary/:id", protect, generateAISummary);

// ADMIN ROUTES
router.get("/user/:userId", protect, roleCheck("admin"), getFilesByUserForAdmin);
router.delete("/user/:userId/:fileId", protect, roleCheck("admin"), deleteFileByAdmin);

export default router;
