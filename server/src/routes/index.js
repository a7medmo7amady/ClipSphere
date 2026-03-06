const express = require("express");
const healthRoutes = require("./healthRoutes");

const router = express.Router();

router.use("/api", healthRoutes);

module.exports = router;

