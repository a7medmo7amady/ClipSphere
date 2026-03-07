import type { Express } from "express";
import mongoSanitize from "express-mongo-sanitize";

export default function applySecurityMiddlewares(app: Express) {
  app.use(
    mongoSanitize({
      onSanitize: ({ key }) => {
        // eslint-disable-next-line no-console
        console.warn(`Sanitized potentially malicious key: ${key}`);
      },
    })
  );
}

