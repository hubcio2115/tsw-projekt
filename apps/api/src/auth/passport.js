import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "~/env.mjs";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/oauth2/redirect/google",
      scope: ["email", "profile"],
      state: true,
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);
    },
  ),
);

export default passport;
