import express from "express";
import { saveChart, getChartsByFile, getChartById, deleteChart } from "../controllers/chartController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/", authMiddleware, saveChart);
router.get("/file/:fileId", authMiddleware, getChartsByFile);
router.get("/:id", authMiddleware, getChartById);
router.delete("/:id", authMiddleware, deleteChart);

export default router;
