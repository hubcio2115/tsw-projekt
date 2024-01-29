import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { verify } from "argon2";
import { getUserById, getUserByName } from "~/db/user";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await getUserByName(username);

    if (!user.success) return done(null, false, { message: "Authentication failed." });

    const authorized = await verify(password, user.data.password);

    if (!authorized)
      return done(null, false, { message: "Authentication failed." });

    return done(null, user.data.id);
  }),
);

passport.serializeUser((id, done) => {
  return done(null, id);
});

passport.deserializeUser(async (id, done) => {
  const user = await getUserById(id);

  if (!user.success) {
    return done("Not found");
  }

  return done(null, {
    id,
    firstName: user.data.firstName,
    lastName: user.data.lastName,
    username: user.data.username,
    email: user.data.email,
  });
});

export default passport;
