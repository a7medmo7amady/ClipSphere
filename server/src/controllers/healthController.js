const catchAsync = require("../utils/catchAsync");
const healthService = require("../services/healthService");

// Simple example controller to demonstrate three-layer architecture.
exports.getHealth = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      ...healthService.getServiceStatus(),
    },
  });
});

