import { hash } from "argon2";
import { Router } from "express";

import passport from "~/auth/passport.js";
import { createUser } from "~/db/user.js";
import {
  checkAuthenticated,
  checkNotAuthenticated,
} from "~/middlewares/isAuthed.js";
import { userSchema } from "~/validators/user.js";

const auth = Router();

auth.post("/login", passport.authenticate("local"), (req, res) => {
  return !req.user ? res.status(403).send() : res.status(200).send(req.user);
});

auth.get("/status", (req, res) => {
  return req.user ? res.send(req.user) : res.sendStatus(401);
});

auth.get("/logout", (req, res) => {
  req.logOut({ keepSessionInfo: false }, () => {
    return res.sendStatus(200);
  });
});

auth.post("/register", async (req, res) => {
  try {
    const body = userSchema.omit({ id: true }).safeParse(req.body);

    if (!body.success || !body.data.password) {
      res.status(401);
      return res.send({
        message: "Not all params, been successfully provided",
      });
    }

    const hashedPassword = await hash(body.data.password);

    const newUser = await createUser({
      firstName: body.data.firstName,
      lastName: body.data.lastName,
      email: body.data.email,
      username: body.data.username,
      password: hashedPassword,
    });

    if (!newUser.success) {
      return res.status(500).send({ message: "Something went wrong." });
    }

    return res.status(200).send({ user: newUser.data });
  } catch (e) {
    console.error(e);

    switch (true) {
      case e instanceof Error:
        return res
          .status(500)
          .send({ message: "Something went wrong: " + e.message });
      default:
        return res.status(500).send({ message: "Something went wrong: " + e });
    }
  }
});

export default auth;
