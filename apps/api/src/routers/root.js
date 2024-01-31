import { Router } from "express";
import { getUserHome } from "~/db/user.js";

import { checkAuthenticated } from "~/middlewares/isAuthed.js";

export const root = Router();

root.get("/ping", (_, res) => {
  res.send({ message: "pong" });
});

root.get("/home", checkAuthenticated, async (req, res) => {
  const posts = await getUserHome(req.user.id);

  return res.status(200).send(posts);
});

