// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

// ✅ Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// =======================
// 🚀 Signup Controller
// =======================
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase();

    // check both collections
    const existingUser = await User.findOne({ email: normalizedEmail });
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Normal User
    if (!role || role === "user") {
      const newUser = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: "user",
        isApproved: true,
      });

      return res.status(201).json({
        message: "Signup successful!",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isApproved: newUser.isApproved,
        },
        token: generateToken(newUser),
      });
    }

    // ✅ Admin (pending approval) → expires in 1 minute
    if (role === "admin") {
      const expiresAt = Date.now() + 60 * 1000; // 1 min expiry
      const newAdmin = await Admin.create({
        name,
        email: normalizedEmail,
        password,
        role: "admin",
        isApproved: false,
        expiresAt, // ⏳ add expiry field
      });

      return res.status(201).json({
        message: "Signup successful! Waiting for Super Admin approval.",
        user: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          isApproved: newAdmin.isApproved,
          expiresAt: newAdmin.expiresAt,
        },
        token: generateToken(newAdmin),
      });
    }

    // ✅ Super Admin (manual/seeding)
    if (role === "super-admin") {
      const newSuperAdmin = await Admin.create({
        name,
        email: normalizedEmail,
        password,
        role: "super-admin",
        isApproved: true,
      });

      return res.status(201).json({
        message: "Super Admin created successfully!",
        user: {
          id: newSuperAdmin._id,
          name: newSuperAdmin.name,
          email: newSuperAdmin.email,
          role: newSuperAdmin.role,
          isApproved: newSuperAdmin.isApproved,
        },
        token: generateToken(newSuperAdmin),
      });
    }

    res.status(400).json({ message: "Invalid role" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// 🚀 Login Controller
// =======================
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    // 🔍 Try to find in Users first
    let user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔑 Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🎟️ Generate token
    const token = generateToken(user);

    // 📌 Decide status
    let status = "active";
    if (user.role === "admin" && !user.isApproved) {
      status = "pending";
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        expiresAt: user.expiresAt || null,
      },
      status,
    });
  } catch (err) {
    console.error("💥 Login error:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =======================
// 🚀 Get Current User
// =======================
export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password");
    // console.log("req:", req.user)
    if (!user) {
      user = await Admin.findById(req.user._id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Ensure consistent response (include expiresAt if exists)
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      expiresAt: user.expiresAt || null, // ⏳ fix for timer NaN
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// 🚀 Delete Myself
// =======================
export const deleteMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      user = await Admin.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("DeleteMe Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
