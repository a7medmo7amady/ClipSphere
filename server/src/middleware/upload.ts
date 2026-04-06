import multer from "multer";
import AppError from "../utils/AppError";

// Storage configuration - memory storage to pipe directly to S3
const storage = multer.memoryStorage();

// File filter to ensure only video files are uploaded
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only video files are allowed!", 400), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export default upload;
