const catchAsync = require("../utils/catchAsync");

// Simple example controller to demonstrate three-layer architecture.
exports.getHealth = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      service: "ClipSphere API",
      timestamp: new Date().toISOString(),
    },
  });
});

