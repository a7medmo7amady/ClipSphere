import catchAsync from "../utils/catchAsync";
import { getServiceStatus } from "../services/healthService";

export const getHealthController = catchAsync(async (_req, res) => {
  res.status(200).json({
    status: "success",
    data: getServiceStatus(),
  });
});
// some test
