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
} from "../controllers/videoController";
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

export default router;
