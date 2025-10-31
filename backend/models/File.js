import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedBy: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);
export default File;
