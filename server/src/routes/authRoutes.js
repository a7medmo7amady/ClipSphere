const express = require("express");
const authController = require("../controllers/authController");
const { validateBody } = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validation/authSchemas");

const router = express.Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);

module.exports = router;

