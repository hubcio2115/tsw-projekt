import { Router } from "express";
import { z } from "zod";
import {
  followUser,
  getUserById,
  getUserHome,
  getUserPosts,
  isFollowing,
  unfollowUser,
  updateUserBio,
} from "~/db/user.js";
import { checkAuthenticated } from "~/middlewares/isAuthed";
import { userSchema } from "~/validators/user.js";

export const users = Router({
  strict: true,
});

users.get("/:id", async (req, res) => {
  const id = userSchema.safeParse(req.params.id);

  if (!id.success) {
    return res.status(403).send({ message: "Id has to be in uuid format." });
  }

  const user = await getUserById(id.data.id);

  if (!user.success) {
    return res.status(404).send({ message: "User not found." });
  }

  return res.send(user.data);
});

users.put("/:id/bio", checkAuthenticated, async (req, res) => {
  const body = z.object({ bio: z.string() }).safeParse(req.body);

  if (!body.success) {
    res.status(401);
    return res.send({ message: "Couldn't parse bio from the request body." });
  }

  const result = await updateUserBio(req.user.id, body.data.bio);

  if (!result.success) {
    return res.status(404).send({ message: "User doesn't exist." });
  }

  return res.send(result.data);
});

users.post("/:id/follow", checkAuthenticated, async (req, res) => {
  const params = z.object({ id: z.string().uuid() }).safeParse(req.params);

  if (!params.success) {
    return res.status(404).send({ message: "User not found." });
  }

  if (req.user.id !== params.data.id) {
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
  const params = z.object({ id: z.string().uuid() }).safeParse(req.params);

  if (!params.success) {
    return res.status(404).send({ message: "User not found." });
  }

  const isFollowingUser = isFollowing(req.user.id, params.data.id);

  return {
    isFollowing: isFollowingUser,
  };
});

users.get("/:id/posts", checkAuthenticated, async (req, res) => {
  const params = z.object({ id: z.string().uuid() }).safeParse(req.params);

  if (!params.success) {
    return res.status(404).send({ message: "User not found." });
  }

  const posts = await getUserPosts(params.data.id);

  if (!posts.success) {
    return res.status(500).send({ message: "Couldn't get posts." });
  }

  return posts.data;
});

users.get("/:id/home", checkAuthenticated, async (req, res) => {
  const posts = await getUserHome(req.user.id);

  return res.send(posts);
});
