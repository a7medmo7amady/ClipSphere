import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import routes from "./routes/index"
import requestLogger from "./middleware/logger";
import applySecurityMiddlewares from "./middleware/security";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";
import passport from "./config/passport";
import stripe from "./config/stripe";

export interface CustomRequest extends Request {
  rawBody?: string;
}

export default function createApp() {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:3000'], // Common local dev ports
    credentials: true,
  }));
  app.use(express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    }
  }));
  app.use(passport.initialize());

  app.use(requestLogger);
  applySecurityMiddlewares(app);

  app.use(routes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

