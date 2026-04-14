import express from "express";
import protect from "../middleware/protect";
import { userRecommendationFeedController } from "../controllers/recommendationController";

const router = express.Router();

router.get("/feed", protect, userRecommendationFeedController);

export default router;
