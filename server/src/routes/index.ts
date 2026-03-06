import express from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";

const router = express.Router();

router.use("/api", healthRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);

export default router;

