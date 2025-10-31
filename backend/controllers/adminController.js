// backend/controllers/adminController.js
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Upload from "../models/Upload.js";

/* ============================
   GET ALL USERS (Admin Only)
============================ */
// controllers/adminController.js
export const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .lean();

    res.json(users);
  } catch (err) {
    console.error("Get all users (admin) error:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
};


/* ============================
   DELETE USER OR ADMIN
============================ */
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check in Users
    let account = await User.findById(id);
    if (account) {
      await account.deleteOne();
      return res.json({ message: "User deleted successfully" });
    }

    // Check in Admins
    account = await Admin.findById(id);
    if (account) {
      // Prevent deleting super-admin
      if (account.role === "super-admin") {
        return res.status(403).json({ message: "Cannot delete super-admin" });
      }
      await account.deleteOne();
      return res.json({ message: "Admin deleted successfully" });
    }

    res.status(404).json({ message: "Account not found" });
  } catch (err) {
    console.error("Delete user/admin error:", err);
    res.status(500).json({ message: "Server error deleting account" });
  }
};

/* ============================
   GET USER FILES
============================ */
export const getUserFilesAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const files = await Upload.find({ user: userId }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error("Get user files error:", err);
    res.status(500).json({ message: "Server error fetching user files" });
  }
};

/* ============================
   DELETE USER FILE
============================ */
export const deleteUserFileAdmin = async (req, res) => {
  try {
    const { userId, fileId } = req.params;

    const file = await Upload.findOne({ _id: fileId, user: userId });
    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(path.resolve(file.path));
      } catch (err) {
        console.warn("File already deleted from disk:", err.message);
      }
    }

    await file.deleteOne();

    if (req.io) req.io.to(userId).emit("fileDeleted", { fileId: file._id });

    res.json({ message: "File deleted successfully", id: file._id });
  } catch (err) {
    console.error("Delete user file error:", err);
    res.status(500).json({ message: "Server error deleting file" });
  }
};

/* ============================
   CREATE USER OR ADMIN
============================ */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email exists in both collections
    const existingUser =
      (await User.findOne({ email })) || (await Admin.findOne({ email }));
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Role restrictions
    if (role === "super-admin") {
      return res.status(403).json({ message: "Cannot create another super-admin" });
    }

    if (req.user.role === "admin" && role === "admin") {
      return res.status(403).json({ message: "Admins cannot create other admins" });
    }

    if (req.user.role === "user") {
      return res.status(403).json({ message: "Users cannot create accounts" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Decide collection based on role
    let newAccount;
    if (role === "admin") {
      newAccount = await Admin.create({
        name,
        email,
        password: hashedPassword,
        role,
        isApproved: role === "admin" ? false : true, // optional
      });
    } else {
      newAccount = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });
    }

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      account: {
        id: newAccount._id,
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
      },
    });
  } catch (err) {
    console.error("Create user/admin error:", err);
    res.status(500).json({ message: "Error creating account", error: err.message });
  }
};
