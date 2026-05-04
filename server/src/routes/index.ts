import express from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import videoRoutes from "./videoRoutes";
import watchHistoryRoutes from "./watchHistoryRoutes";
import adminRoutes from "./adminRoutes";
import docsRoutes from "./docsRoutes";
import recommendationRoutes from "./recommendationRoutes";
import notificationRoutes from "./notificationRoutes";
import tipRoutes from "./tipRoutes";
import { apiLimiter } from "../middleware/rateLimiter";

const router = express.Router();


router.use("/api/docs", docsRoutes);
router.use("/api/v1", apiLimiter);
router.use("/api/v1", healthRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/users", userRoutes);
router.use("/api/v1/videos", videoRoutes);
router.use("/api/v1/watch-history", watchHistoryRoutes);
router.use("/api/v1/recommendations", recommendationRoutes);
router.use("/api/v1/admin", adminRoutes);
router.use("/api/v1/notifications", notificationRoutes);
router.use("/api/v1/tips", tipRoutes);

export default router;

