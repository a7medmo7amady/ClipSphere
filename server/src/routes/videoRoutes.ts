import express from "express";
import protect from "../middleware/protect";
import upload from "../middleware/upload";
import { validateBody } from "../middleware/validate";
import {
  createVideoController,
  getAllPublicVideosController,
  getVideoController,
  updateVideoController,
  deleteVideoController,
  createReviewController,
  getReviewsController,
  likeVideoController,
  unlikeVideoController,
  checkLikeStatusController,
} from "../controllers/videoController";
import { similarVideosController } from "../controllers/recommendationController";
import {
  createVideoSchema,
  updateVideoSchema,
  createReviewSchema,
} from "../validation/videoSchemas";
import {
  requireVideoOwnership,
  requireVideoOwnershipOrAdmin,
} from "../middleware/authorize";

const router = express.Router();

router.get("/", getAllPublicVideosController);
router.get("/:id/recommendations", similarVideosController);
router.get("/:id", getVideoController);
router.post(
  "/",
  protect,
  upload.single("video"),
  validateBody(createVideoSchema),
  createVideoController
);
router.patch(
  "/:id",
  protect,
  validateBody(updateVideoSchema),
  requireVideoOwnership,
  updateVideoController
);
router.delete("/:id", protect, requireVideoOwnershipOrAdmin, deleteVideoController);
router.post(
  "/:id/reviews",
  protect,
  validateBody(createReviewSchema),
  createReviewController
);
router.get("/:id/reviews", getReviewsController);

router.post("/:id/like", protect, likeVideoController);
router.delete("/:id/like", protect, unlikeVideoController);
router.get("/:id/like/status", protect, checkLikeStatusController);

export default router;
