import fs from "fs";
import path from "path";
import File from "../models/File.js";
import Upload from "../models/Upload.js";

/**
 * GET /api/admin/files/:userId
 * Get all files uploaded by a specific user (admin or super-admin)
 */
export const getUserFilesAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const files = await Upload.find({ user: userId });
    // console.log(files);
    res.json(files);
  } catch (err) {
    console.error("Get user files error:", err);
    res.status(500).json({ message: "Server error fetching user files" });
  }
};

/**
 * DELETE /api/admin/files/:userId/:fileId
 * Delete a specific file uploaded by a user
 */
export const deleteUserFileAdmin = async (req, res) => {
  try {
    const { userId, fileId } = req.params;

    const file = await Upload.findOne({ _id: fileId, user: userId });
    if (!file) return res.status(404).json({ message: "File not found" });

    // Delete file from filesystem
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(path.resolve(file.path));
    }

    // Delete file document
    await file.deleteOne();

    // Notify user via Socket.IO
    if (req.io) {
      req.io.to(userId).emit("fileDeleted", { fileId: file._id });
    }

    res.json({ message: "File deleted successfully", id: file._id });
  } catch (err) {
    console.error("Delete user file error:", err);
    res.status(500).json({ message: "Server error deleting file" });
  }
};
