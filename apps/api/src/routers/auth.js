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

auth.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    failureMessage: true,
  }),
);

auth.get("/logout", checkAuthenticated, (req, res) => {
  req.logOut({ keepSessionInfo: false }, () => {
    return res.sendStatus(200);
  });
});

auth.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const body = userSchema.safeParse(req.body);

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
