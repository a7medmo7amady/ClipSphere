import express from "express";
import {
  getMeController,
  updateMeController,
  updateAvatarController,
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
  updateMeSchema,
  updateAvatarSchema,
  updatePreferencesSchema,
} from "../validation/userSchemas";

const router = express.Router();
// Protected: current user profile & preferences
router.get("/me", protect, getMeController);
router.patch("/me", protect, validateBody(updateMeSchema), updateMeController);
router.patch("/me/avatar", protect, validateBody(updateAvatarSchema), updateAvatarController);
router.patch("/me/preferences", protect, validateBody(updatePreferencesSchema), updatePreferencesController);


router.get("/:id", getUserByIdController);

// Follow / unfollow (protected; self-follow rejected in service + Follower pre-save hook)
router.post("/:id/follow", protect, followController);
router.delete("/:id/follow", protect, unfollowController);

// Public: list followers / following for any user
router.get("/:id/followers", getFollowersController);
router.get("/:id/following", getFollowingController);

export default router;

