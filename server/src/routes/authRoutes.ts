import express from "express";
import { registerController, loginController, verifyEmailController } from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validation/authSchemas";

const router = express.Router();

router.post("/register", validateBody(registerSchema), registerController);
router.post("/login", validateBody(loginSchema), loginController);
router.post("/verify-email", verifyEmailController);

export default router;

