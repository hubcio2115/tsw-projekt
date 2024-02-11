import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { getUserById, getUserByName } from "~/db/user.js";

passport.use(
  new LocalStrategy(async (name, password, done) => {
    const user = await getUserByName(name);

    if (!user.success)
      return done(null, false, { message: "Authentication failed." });

    const authorized = await Bun.password.verify(password, user.data.password);

    if (!authorized)
      return done(null, false, { message: "Authentication failed." });

    const { password: pass, ...returnUser } = user.data;

    return done(null, returnUser);
  }),
);

passport.serializeUser(async (u, done) => {
  const user = await getUserById(u.id);

  if (!user.success) {
    return done("Not found");
  }

  return done(null, {
    id: u.id,
    firstName: user.data.firstName,
    lastName: user.data.lastName,
    username: user.data.username,
    email: user.data.email,
  });
});

passport.deserializeUser(async (id, done) => {
  return done(null, id);
});

export default passport;
