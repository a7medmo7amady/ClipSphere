import multer from "multer";
import AppError from "../utils/AppError";

// Storage configuration - memory storage to pipe directly to S3
const storage = multer.memoryStorage();

// Strict list of allowed video MIME types
const allowedMimes = ["video/mp4", "video/webm", "video/quicktime"];

// File filter to ensure only specific video files are uploaded
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only mp4, webm, and mov video files are allowed!", 400), false);
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
