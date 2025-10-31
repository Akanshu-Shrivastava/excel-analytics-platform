// backend/seedSuperAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: "chitransh@gmail.com" });
    if (existing) {
      console.log("Super Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);

    const superAdmin = new User({
      name: "Chitransh",
      email: "chitransh@gmail.com",
      password: hashedPassword,
      role: "super-admin",
      isApproved: true,
    });

    await superAdmin.save();
    console.log("✅ Super Admin created successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSuperAdmin();
