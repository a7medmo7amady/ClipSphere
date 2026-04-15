import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { logWatch } from "../services/watchHistoryService";

export const logWatchController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));

  await logWatch(req.user._id.toString(), req.body);

  res.status(201).json({
    status: "success",
    message: "Watch history logged",
  });
});
