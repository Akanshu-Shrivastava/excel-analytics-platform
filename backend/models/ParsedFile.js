import mongoose from "mongoose";

const ParsedFileSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // You can adjust this to 'Admin' if needed
    required: true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  savedFileName: {
    type: String,
    required: true,
  },
  data: [
    {
      name: String,
      Email: String,
      Score: Number,
    },
  ],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ParsedFile", ParsedFileSchema);
