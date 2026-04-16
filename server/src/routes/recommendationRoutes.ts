import express from "express";
import protect from "../middleware/protect";
import {
	trendingVideosController,
	userRecommendationFeedController,
} from "../controllers/recommendationController";

const router = express.Router();

router.get("/feed", protect, userRecommendationFeedController);
router.get("/trending", trendingVideosController);

export default router;
