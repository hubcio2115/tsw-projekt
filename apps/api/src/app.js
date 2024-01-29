import neo4jStoreCreate from "connect-neo4j-user";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";

import passport from "~/auth/passport.js";

import { driver } from "./db/db.js";
import { env } from "./env.mjs";
import { checkAuthenticated } from "./middlewares/isAuthed.js";
import { posts } from "./routers/posts.js";
import { root } from "./routers/root.js";
import { users } from "./routers/users.js";

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

app.use("users", users);
app.use("posts", posts);
app.use("/", root);

app.listen(8080);
console.log("App listening at port: 8080");
