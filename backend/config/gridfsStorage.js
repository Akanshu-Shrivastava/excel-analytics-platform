// backend/config/gridfsStorage.js
import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";

const mongoURI = process.env.MONGO_URI; // ensure this exists in .env

// bucketName 'uploads' used for both upload and download (fs.files / fs.chunks collections will be uploads.files / uploads.chunks)
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads", // collection names: uploads.files / uploads.chunks
      metadata: {
        uploadedBy: req.user?._id || null,
      },
    };
  },
});

export const uploadMiddleware = multer({ storage });
