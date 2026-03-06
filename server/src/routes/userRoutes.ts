import express from "express";
import {
  getMeController,
  updateMeController,
  updateAvatarController,
} from "../controllers/userController";
import protect from "../middleware/protect";
import { validateBody } from "../middleware/validate";
import { updateMeSchema, updateAvatarSchema } from "../validation/userSchemas";

const router = express.Router();

router.get("/me", protect, getMeController);
router.patch("/me", protect, validateBody(updateMeSchema), updateMeController);
router.patch("/me/avatar", protect, validateBody(updateAvatarSchema), updateAvatarController);

export default router;

