import cors from "cors";
import express from "express";
import session from "express-session";
import { createServer } from "node:https";
import { Server } from "socket.io";

import passport from "~/auth/passport.js";

import { env } from "./env.mjs";
import auth from "./routers/auth.js";
import { posts } from "./routers/posts.js";
import { root } from "./routers/root.js";
import { users } from "./routers/users.js";
import { readFileSync } from "node:fs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, set-cookie");
  next();
});

const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: env.AUTH_SECRET,
    resave: false,
    name: "session",
    saveUninitialized: false,
    store: memoryStore,
    cookie: {
      httpOnly: false,
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

const server = createServer(
  {
    passphrase: "",
    key: readFileSync("./ssl/private-key.pem"),
    cert: readFileSync("./ssl/certificate.pem"),
  },
  app
);

const io = new Server(server, {
  cors: {
    origin: "https://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected ", socket.id);

  socket.on(
    "follow",
    /** @param {{ sender: string; target: string; senderUsername: string}} message */(
      message,
    ) => {
      console.debug(message);
      io.emit("followed", message);
    },
  );

  socket.on("disconnect", () => {
    console.log("Disconnect ", socket.id);
  });
});

server.listen(8080, () => {
  console.log("Server running on localhost:8080");
});
