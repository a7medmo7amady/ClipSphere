const express = require("express");
const userController = require("../controllers/userController");
const protect = require("../middleware/protect");
const { validateBody } = require("../middleware/validate");
const { updateMeSchema, updateAvatarSchema } = require("../validation/userSchemas");

const router = express.Router();

router.get("/me", protect, userController.getMe);
router.patch("/me", protect, validateBody(updateMeSchema), userController.updateMe);
router.patch(
  "/me/avatar",
  protect,
  validateBody(updateAvatarSchema),
  userController.updateAvatar
);

module.exports = router;

