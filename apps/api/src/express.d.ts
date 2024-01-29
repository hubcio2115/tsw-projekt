import { type User as TUser } from "~/validators/user";

declare module "express-serve-static-core" {
  interface User extends TUser { }

  interface Request {
    user?: User;
  }
}
