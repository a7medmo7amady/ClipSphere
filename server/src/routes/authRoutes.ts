import express from "express";
import { registerController, loginController, verifyEmailController } from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validation/authSchemas";
import { signToken } from "../services/authService";
import passport from "passport";
const router = express.Router();

router.post("/register", validateBody(registerSchema), registerController);
router.post("/login", validateBody(loginSchema), loginController);
router.post("/verify-email", verifyEmailController);


router.get("/google",passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/google/callback",passport.authenticate("google", { failureRedirect: "http://localhost:3000/auth", session: false }),
  (req, res) => {
    const user = req.user as any;
    const token = signToken(user._id.toString());
    res.redirect(`http://localhost:3000/oauth?token=${token}`); 
  }
);
router.post("/logout", (req, res, next) => {
    req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});
export default router;

