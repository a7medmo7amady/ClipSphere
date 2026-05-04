import type { Express } from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";

export default function applySecurityMiddlewares(app: Express) {
  app.use(helmet());
  app.use(
    mongoSanitize({
      onSanitize: ({ key }) => {
        // eslint-disable-next-line no-console
        console.warn(`Sanitized potentially malicious key: ${key}`);
      },
    })
  );
}

