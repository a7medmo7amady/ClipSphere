import express from "express";
import { createTipSession, handleStripeWebhook } from "../controllers/tipController";
import protect from "../middleware/protect";

const router = express.Router();

router.post("/create-session", protect, createTipSession);
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;