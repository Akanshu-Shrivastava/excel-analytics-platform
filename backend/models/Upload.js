// backend/models/Upload.js
import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String },
    size: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gridFsId: { type: mongoose.Schema.Types.ObjectId, required: true }, // reference to fs.files _id
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt automatically
);

export default mongoose.model("Upload", UploadSchema);
