import express from "express";
import cors from "cors";
import routes from "./routes/index"
import requestLogger from "./middleware/logger";
import applySecurityMiddlewares from "./middleware/security";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";
import passport from "passport";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
// import cors from "cors";
export default function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  app.use(requestLogger);
  applySecurityMiddlewares(app);

  app.use(routes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

