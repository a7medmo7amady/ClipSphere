import type { HydratedDocument } from "mongoose";
import type { IUser } from "../models/User";

declare global {
  namespace Express {
    interface User extends HydratedDocument<IUser> {}
    interface Request {
      user?: User;
    }
  }
}

export {};

