import Admin from "../models/Admin.js";
import User from "../models/User.js";

// ✅ Create admin (super-admin only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newAdmin = await Admin.create({
      name,
      email,
      password,
      role: "admin",
      isApproved: true,
    });

    res.status(201).json({
      message: "Admin created successfully",
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending admins
export const getPendingAdmins = async (req, res) => {
  try {
    const expiryTime = new Date(Date.now() - 60 * 1000);
    await Admin.deleteMany({
      role: "admin",
      isApproved: false,
      createdAt: { $lt: expiryTime },
    });

    const pendingAdmins = await Admin.find({
      role: "admin",
      isApproved: false,
    }).sort({ createdAt: 1 });

    res.json(pendingAdmins);
  } catch (err) {
    console.error("Get pending admins error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve admin
export const approveAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    console.log(admin)
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    

    admin.isApproved = true;
    await admin.save();

    if (req.io) {
      req.io.to(admin._id.toString()).emit("adminApproved", {
        userId: admin._id,
        message: "Your request has been approved",
      });
    }

    res.json({ message: "Admin approved successfully", admin });
  } catch (err) {
    console.error("Approve admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject admin
export const rejectAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (req.io) {
      req.io.to(admin._id.toString()).emit("adminRejected", {
        userId: admin._id,
        message: "Your request has been rejected",
      });
    }

    await admin.deleteOne();
    res.json({ message: "Admin rejected successfully" });
  } catch (err) {
    console.error("Reject admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users + admins (no super-admins)
// controllers/adminController.js
// controllers/superAdminController.js
export const getAllUsersAndAdmins = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").lean();
    const admins = await Admin.find({ role: "admin" }).select("-password").lean();

    res.json([...users, ...admins]);
  } catch (err) {
    console.error("Get all users/admins error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user or admin
export const deleteUserOrAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findById(id);
    let collection = "User";

    if (!user) {
      user = await Admin.findById(id);
      collection = "Admin";
    }

    if (!user) return res.status(404).json({ message: "User/Admin not found" });
    if (user.role === "super-admin") return res.status(403).json({ message: "Cannot delete super-admins" });

    await user.deleteOne();
    res.json({ message: `${collection} (${user.role}) deleted successfully` });
  } catch (err) {
    console.error("Delete user/admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Self delete (timeout cleanup)
export const selfDeleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin || admin.role !== "admin" || admin.isApproved) return res.status(404).json({ message: "Pending admin not found" });

    await admin.deleteOne();
    res.json({ message: "Admin deleted due to timeout/rejection" });
  } catch (err) {
    console.error("Self delete admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
