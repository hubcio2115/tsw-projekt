import express from "express";
import { getUserById } from "~/db/user.js";
import { userSchema } from "~/validators/user.js";

export const user = express.Router();

user.get("/:id", async (req, res) => {
  const id = userSchema.safeParse(req.params.id);

  if (!id.success) {
    return res.status(403).send({ message: "Id has to be in uuid format." });
  }

  const user = await getUserById(id.data.id);

  if (!user.success) {
    return res.status(404).send({ message: "User not found." });
  }

  return res.send(user.data);
});

user.post("/regiseter", (req, res) => {
});
