import { hash } from "argon2";
import { Router } from "express";
import { z } from "zod";

import {
  followUser,
  getAllUsers,
  getUserById,
  getUserPosts,
  isFollowing,
  unfollowUser,
  updateUserBio,
  updateUserById,
} from "~/db/user.js";
import { checkAuthenticated } from "~/middlewares/isAuthed.js";
import { authSchema } from "~/validators/user.js";

export const users = Router({
  strict: true,
});

users.get("/", checkAuthenticated, async (req, res) => {
  const users = await getAllUsers(req.user?.id);

  return res.status(200).send(users);
});

users.get("/:id", async (req, res) => {
  const id = z.object({ id: z.string() }).safeParse(req.params);

  if (!id.success) {
    return res.status(403).send({ message: "Id has to be in uuid format." });
  }

  const user = await getUserById(id.data.id);

  if (!user.success) {
    return res.status(404).send({ message: "User not found." });
  }

  return res.status(200).send(user.data);
});

users.put("/details", checkAuthenticated, async (req, res) => {
  const newDetails = authSchema.safeParse(req.body);

  if (!newDetails.success) {
    return res.status(403).send({ message: "Not all values were provided." });
  }

  const hashedPassword = await hash(newDetails.data.password);

  const newUser = await updateUserById(req.user?.id, {
    ...newDetails.data,
    password: hashedPassword,
  });

  if (!newUser.success) {
    return res.status(500).send({ message: "Something went wrong." });
  }

  return res.status(200).send(newUser.data);
});

users.patch("/:id/bio", checkAuthenticated, async (req, res) => {
  const body = z.object({ bio: z.string() }).safeParse(req.body);

  if (!body.success) {
    res.status(401);
    return res.send({ message: "Couldn't parse bio from the request body." });
  }

  const result = await updateUserBio(req.user.id, body.data.bio);

  if (!result.success) {
    return res.status(404).send({ message: "User doesn't exist." });
  }

  return res.status(200).send(result.data);
});

users.post("/:id/follow", checkAuthenticated, async (req, res) => {
  const params = z.object({ id: z.string() }).safeParse(req.params);
  if (!params.success) {
    return res.status(404).send({ message: "User not found." });
  }

  if (req.user.id === params.data.id) {
    return res.status(400).send({ message: "You cannot follow yourself." });
  }

  const isFollowingUser = await isFollowing(req.user.id, params.data.id);

  if (isFollowingUser) {
    await unfollowUser(req.user.id, params.data.id);
  } else {
    await followUser(req.user.id, params.data.id);
  }

  return res.sendStatus(200);
});

users.get("/:id/isFollowing", checkAuthenticated, async (req, res) => {
  const params = z.object({ id: z.string() }).safeParse(req.params);

  if (!params.success) {
    return res.status(404).send({ message: "User not found." });
  }

  const isFollowingUser = await isFollowing(req.user.id, params.data.id);

  return res.status(200).send({ isFollowing: isFollowingUser });
});

users.get("/:id/posts", checkAuthenticated, async (req, res) => {
  const params = z.object({ id: z.string() }).safeParse(req.params);

  if (!params.success) {
    return res.status(404).send({ message: "User not found." });
  }

  const posts = await getUserPosts(params.data.id);

  if (!posts.success) {
    return res.status(500).send({ message: "Couldn't get posts." });
  }

  return res.status(200).send(posts.data);
});
