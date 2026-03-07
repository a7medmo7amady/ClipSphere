import express from "express";
import { getHealthController } from "../controllers/healthController";

const router = express.Router();

router.get("/health", getHealthController);

export default router;

