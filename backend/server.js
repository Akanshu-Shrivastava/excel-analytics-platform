import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";

// ✅ Import models
import File from "./models/File.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ✅ Attach io to req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", uploadRoutes);
app.use("/api/super-admin", superAdminRoutes);

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// ✅ Download route
app.get("/api/files/download/:fileId", async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    console.error("❌ Download error:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// ✅ Socket.IO logic
io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  // User joins their own room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
