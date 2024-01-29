import { Router } from "express";

import { checkAuthenticated } from "~/middlewares/isAuthed";

export const root = Router();

root.get("/ping", (_req, res) => {
  res.send({ message: "pong" });
});
