import cors from "cors";
import express from "express";
import session from "express-session";
import { readFileSync } from "node:fs";
import { createServer } from "node:https";
import { join as pathJoin } from "node:path";
import { Server } from "socket.io";

import passport from "~/auth/passport.js";

import { getUserFollowers } from "./src/db/user.js";
import { env } from "./src/env.mjs";
import auth from "./src/routers/auth.js";
import { posts } from "./src/routers/posts.js";
import { root } from "./src/routers/root.js";
import { users } from "./src/routers/users.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  }),
);

const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: env.AUTH_SECRET,
    resave: false,
    name: "session",
    saveUninitialized: false,
    store: memoryStore,
    cookie: {
      secure: true,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/auth", auth);
app.use("/api", root);

const staticPath = pathJoin(__dirname, "static");
app.use(express.static(staticPath));

app.get("*", (_, res) => {
  res.sendFile(pathJoin(staticPath, "index.html"));
});

const server = createServer(
  {
    passphrase: "",
    key: readFileSync("./ssl/private-key.pem"),
    cert: readFileSync("./ssl/certificate.pem"),
  },
  app,
);

const io = new Server(server, {
  cors: {
    origin: "https://localhost:5173",
    credentials: true,
  },
});

const followNamespace = io.of("/follow");

followNamespace.on("connection", (socket) => {
  console.log("Connected to /follow ", socket.id);

  socket.on(
    "follow",
    /** @param {{ sender: string; target: string; senderUsername: string }} message */(
      message,
    ) => {
      console.debug(message);
      followNamespace.emit("followed", message);
    },
  );

  socket.on("disconnect", () => {
    console.log("Disconnect ", socket.id);
  });
});

const postNamespace = io.of("/post");

postNamespace.on("connection", (socket) => {
  console.log("Connected to /post ", socket.id);

  socket.on(
    "post",
    /** @param {string} userId */ async (userId) => {
      const followers = await getUserFollowers(userId);

      console.log(followers);

      postNamespace.emit("posted", followers);
    },
  );

  socket.on("disconnect", () => {
    console.log("Disconnect ", socket.id);
  });
});

server.listen(8080, () => {
  console.log("Server running on localhost:8080");
});
