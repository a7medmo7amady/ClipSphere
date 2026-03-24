import express from "express";
import { registerController, loginController, verifyEmailController } from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validation/authSchemas";
import passport from "passport";
const router = express.Router();

router.post("/register", validateBody(registerSchema), registerController);
router.post("/login", validateBody(loginSchema), loginController);
router.post("/verify-email", verifyEmailController);


router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/page"); 
  }
);
router.post("/logout", (req, res, next) => {
    req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});
export default router;

