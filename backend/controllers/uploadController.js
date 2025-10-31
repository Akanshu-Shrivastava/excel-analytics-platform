// backend/controllers/uploadController.js
import mongoose from "mongoose";
import XLSX from "xlsx";
import Upload from "../models/Upload.js";
import axios from "axios";


const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/* ========== GROQ API ========== */
export const getGroqSummary = async (prompt) => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "gpt-summary",
        input: prompt,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.output || "No summary returned.";
  } catch (err) {
    console.error("Groq API Error:", err.response?.data || err.message);
    throw new Error("Failed to fetch summary from Groq API");
  }
};

/* ========== GRIDFS ========== */
const conn = mongoose.connection;
let gridfsBucket;

conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  console.log("✅ GridFS initialized");
});

/* ========== USER FUNCTIONS ========== */

// 📤 Upload Excel File
export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!gridfsBucket)
      return res.status(500).json({ message: "GridFS not ready" });

    const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.once("finish", async () => {
      try {
        // 🔑 Fetch the stored file metadata from GridFS
        const filesCollection =
          mongoose.connection.db.collection("uploads.files");
        const storedFile = await filesCollection.findOne({
          filename: req.file.originalname,
        });

        if (!storedFile) {
          console.error("❌ File saved to GridFS but metadata not found");
          return res.status(500).json({ message: "File upload incomplete" });
        }

        const newFile = await Upload.create({
          user: req.user.id,
          originalName: req.file.originalname,
          filename: storedFile.filename,
          gridFsId: storedFile._id, // ✅ now correctly fetched
          size: req.file.size,
          contentType: req.file.mimetype,
        });

        console.log("✅ File uploaded with GridFS ID:", storedFile._id);
        res.status(201).json(newFile);
      } catch (err) {
        console.error("Error creating Upload document:", err);
        res.status(500).json({ message: "Failed to save file metadata" });
      }
    });

    uploadStream.once("error", (err) => {
      console.error("❌ GridFS upload error:", err);
      res.status(500).json({ message: "File upload failed" });
    });
  } catch (err) {
    console.error("❌ Upload controller error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const downloadExcelFile = async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    if (!file.gridFsId) {
      console.error("❌ Missing gridFsId in Upload document:", file);
      return res
        .status(400)
        .json({ message: "File metadata incomplete (no gridFsId)" });
    }

    console.log("📥 Downloading file with GridFS ID:", file.gridFsId);

    const downloadStream = gridfsBucket.openDownloadStream(file.gridFsId);

    res.set("Content-Type", file.contentType);
    res.set(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`
    );

    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("❌ Download error:", err);
      res.status(500).json({ message: "Error downloading file" });
    });
  } catch (err) {
    console.error("❌ Download controller error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getParsedFileById = async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    if (!file.gridFsId) {
      console.error("❌ Missing gridFsId in Upload document:", file);
      return res
        .status(400)
        .json({ message: "File metadata incomplete (no gridFsId)" });
    }

    console.log("📊 Parsing file with GridFS ID:", file.gridFsId);

    const downloadStream = gridfsBucket.openDownloadStream(file.gridFsId);
    const chunks = [];

    downloadStream.on("data", (chunk) => chunks.push(chunk));

    downloadStream.on("end", () => {
      try {
        const buffer = Buffer.concat(chunks);
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        res.json({ data: sheet });
      } catch (err) {
        console.error("❌ Parse error:", err);
        res.status(500).json({ message: "Error parsing file" });
      }
    });

    downloadStream.on("error", (err) => {
      console.error("❌ GridFS stream error:", err);
      res.status(500).json({ message: "Error reading file" });
    });
  } catch (err) {
    console.error("❌ getParsedFileById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Delete file
export const deleteFile = async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!file.gridFsId) {
      return res
        .status(400)
        .json({ message: "File metadata incomplete (no gridFsId)" });
    }

    console.log("🗑 Deleting file:", file._id, "GridFS ID:", file.gridFsId);

    // Ensure ObjectId
    const gridFsId =
      typeof file.gridFsId === "string"
        ? new mongoose.Types.ObjectId(file.gridFsId)
        : file.gridFsId;

    await gridfsBucket.delete(gridFsId);
    await file.deleteOne();

    res.json({ message: "File deleted successfully", id: file._id });
  } catch (error) {
    console.error("❌ Delete File Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ========== ADMIN: Get files of a user ========== */
export const getFilesByUserForAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const files = await Upload.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("_id originalName size uploadedAt");

    return res.json(files);
  } catch (error) {
    console.error("Admin Get Files Error:", error.message);
    res.status(500).json({ message: "Failed to fetch user files" });
  }
};

/* ========== ADMIN: Delete a user's file ========== */
export const deleteFileByAdmin = async (req, res) => {
  try {
    const { userId, fileId } = req.params;

    const file = await Upload.findOne({ _id: fileId, user: userId });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    await gridfsBucket.delete(new mongoose.Types.ObjectId(file.gridFsId));
    await file.deleteOne();

    return res.json({
      message: "File deleted successfully by admin",
      id: file._id,
    });
  } catch (error) {
    console.error("Admin Delete File Error:", error.message);
    res.status(500).json({ message: "Failed to delete file by admin" });
  }
};

export const generateAISummary = async (req, res) => {
  try {
    console.log("🔍 Entering generateAISummary for file:", req.params.id);

    // 1. Find file in Mongo
    const file = await Upload.findById(req.params.id);
    if (!file) {
      console.error("❌ File not found in Mongo:", req.params.id);
      return res.status(404).json({ message: "File not found" });
    }
    console.log("✅ File found:", file.filename);

    // 2. Ensure GridFS is ready
    if (!gridfsBucket) {
      console.error("❌ GridFS not initialized yet");
      return res.status(500).json({ message: "Storage not ready. Try again later." });
    }

    console.log("📦 GridFS ID:", file.gridFsId);

    // 3. Convert stream → buffer
    const gridFsId = mongoose.Types.ObjectId.isValid(file.gridFsId)
      ? new mongoose.Types.ObjectId(file.gridFsId)
      : file.gridFsId;

    const buffer = await new Promise((resolve, reject) => {
      const chunks = [];
      const downloadStream = gridfsBucket.openDownloadStream(gridFsId);

      downloadStream.on("data", (chunk) => chunks.push(chunk));
      downloadStream.on("error", (err) => reject(err));
      downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
    });

    console.log("📥 Finished reading file from GridFS");

    // 4. Parse Excel
    const workbook = XLSX.read(buffer, { type: "buffer" });
    console.log("📊 Sheets found:", workbook.SheetNames);

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      console.error("❌ No sheets in file");
      return res.status(400).json({ message: "Excel file has no sheets" });
    }

    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log("✅ Parsed rows:", worksheet.length);

    const previewData = worksheet.slice(0, 10);
    console.log("🔍 Preview data:", previewData);

    // 5. Build prompt & get summary from Groq
    const prompt = `Summarize this Excel data : ${JSON.stringify(previewData, null, 2)}`;
    console.log("🧠 Sending prompt to Groq...");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
       ` Groq API Error: ${data.error?.message || response.statusText}`
      );
    }

    const insights = data.choices[0].message.content
      .split("\n")
      .filter((line) => line.trim());

    res.json({ insights });

    // const summary = await getGroqSummary(prompt);

    console.log("✅ Got summary:", insights);

    // 6. Send response
    // return res.json({ summary });
  } catch (error) {
    console.error("❌ General AI summary error:", error);
    return res.status(500).json({ message: "Failed to generate summary" });
  }
};


/* ========== USER HISTORY ========== */
export const getUploadHistory = async (req, res) => {
  try {
    const files = await Upload.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("_id originalName size uploadedAt");

    return res.json(files);
  } catch (error) {
    console.error("Get Upload History Error:", error.message);
    res.status(500).json({ message: "Failed to fetch upload history" });
  }
};
