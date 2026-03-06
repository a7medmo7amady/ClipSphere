declare module "express-mongo-sanitize" {
  import type { RequestHandler } from "express";

  export interface MongoSanitizeOptions {
    replaceWith?: string;
    allowDots?: boolean;
    onSanitize?: (info: { req: any; key: string }) => void;
    dryRun?: boolean;
  }

  export default function mongoSanitize(options?: MongoSanitizeOptions): RequestHandler;
}

