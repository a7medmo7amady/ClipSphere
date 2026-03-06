const express = require("express");
const healthController = require("../controllers/healthController");

const router = express.Router();

// Entry point (route) layer: maps HTTP verb + path to controller.
router.get("/health", healthController.getHealth);

module.exports = router;

