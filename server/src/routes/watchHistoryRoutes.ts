import express from "express";
import protect from "../middleware/protect";
import { validateBody } from "../middleware/validate";
import { logWatchSchema } from "../validation/watchHistorySchemas";
import { logWatchController } from "../controllers/watchHistoryController";

const router = express.Router();

router.post("/", protect, validateBody(logWatchSchema), logWatchController);

export default router;
