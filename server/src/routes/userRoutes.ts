import express from "express";
import {
  getMeController,
  updateMeController,
  updatePreferencesController,
  followController,
  unfollowController,
  getFollowersController,
  getFollowingController,
  getUserByIdController,
} from "../controllers/userController";
import protect from "../middleware/protect";
import { validateBody } from "../middleware/validate";
import {
  updateUserSchema,
  updatePreferencesSchema,
} from "../validation/userSchemas";

const router = express.Router();
// Protected: current user profile & preferences
router.get("/me", protect, getMeController);
router.patch("/updateMe", protect, validateBody(updateUserSchema), updateMeController);
router.patch("/me/preferences", protect, validateBody(updatePreferencesSchema), updatePreferencesController);


router.get("/:id", getUserByIdController);

// Follow / unfollow (protected; self-follow rejected in service + Follower pre-save hook)
router.post("/:id/follow", protect, followController);
router.delete("/:id/unfollow", protect, unfollowController);

// Public: list followers / following for any user
router.get("/:id/followers", getFollowersController);
router.get("/:id/following", getFollowingController);

export default router;

