import express from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import videoRoutes from "./videoRoutes";

const router = express.Router();

router.use("/api/v1", healthRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/users", userRoutes);
router.use("/api/v1/videos", videoRoutes);

export default router;

