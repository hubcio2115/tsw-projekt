import { Router } from "express";

export const root = Router();

root.get("/ping", (_, res) => {
  res.send({ message: "pong" });
});

