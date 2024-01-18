import express from "express";
import session from "express-session";
import passport from "~/auth/passport.js";
import neo4jStoreCreate from "connect-neo4j-user";
import { env } from "./env.mjs";
import { driver } from "./db/db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const Neo4jStore = neo4jStoreCreate(session);

app.use(
  session({
    secret: env.AUTH_SECRET,
    resave: false,
    saveUninitialized: false,
    // @ts-expect-error
    store: new Neo4jStore({ client: driver }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (_req, res) => {
  res.send({ message: "Hello World!" });
});

app.get("/login/google", passport.authenticate("google"));

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureMessage: true,
  }),
  function(_, res) {
    res.redirect("/");
  },
);

app.listen(8080);
console.log("App listening at port: 8080");
