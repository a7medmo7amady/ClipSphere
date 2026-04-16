import express from "express";
import protect from "../middleware/protect";
import {
  getNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
} from "../controllers/notificationController";

const router = express.Router();

router.use(protect);

router.get("/", getNotificationsController);
router.get("/unread-count", getUnreadCountController);
router.patch("/read-all", markAllAsReadController);
router.patch("/:id/read", markAsReadController);

export default router;
