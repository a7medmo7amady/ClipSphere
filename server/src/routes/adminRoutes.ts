import express from "express";
import protect from "../middleware/protect";
import { restrictTo } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import {
  adminHealthController,
  getStatsController,
  updateUserStatusController,
  moderationQueueController,
} from "../controllers/adminController";
import { updateUserStatusSchema } from "../validation/adminSchemas";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/health", adminHealthController);
router.get("/stats", getStatsController);
router.patch("/users/:id/status", validateBody(updateUserStatusSchema), updateUserStatusController);
router.get("/moderation", moderationQueueController);

export default router;
