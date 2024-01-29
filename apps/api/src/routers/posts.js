import { Router } from "express";
import { z } from "zod";

import {
  createPost,
  createQuote,
  getPostById,
  getPostReplies,
  replyToPost,
} from "~/db/posts";
import { checkAuthenticated } from "~/middlewares/isAuthed";

export const posts = Router();

posts.post("/", checkAuthenticated, async (req, res) => {
  const body = z
    .object({ userId: z.string(), content: z.string().min(1) })
    .safeParse(req.body);

  if (!body.success) {
    return res
      .status(403)
      .send({ message: "You have to provide userId and content of the post." });
  }

  const { userId, content } = body.data;

  const result = await createPost(userId, content);

  if (!result.success) {
    return res.status(500).send({ message: "Something went wront." });
  }

  return result.data;
});

posts.post("/quote", checkAuthenticated, async (req, res) => {
  const body = z
    .object({
      postId: z.string(),
      content: z.string(),
    })
    .safeParse(req.body);

  if (!body.success) {
    return res
      .status(401)
      .send({ message: "Body has to contain postId and content." });
  }

  const post = await createQuote(
    req.user.id,
    body.data.postId,
    body.data.content,
  );

  return res.send(post);
});

posts.get("/:id", checkAuthenticated, async (req, res) => {
  const params = z.object({ id: z.string().uuid() }).safeParse(req.params);

  if (!params.success) {
    return res.status(404).send({ message: "Post not found." });
  }

  const post = await getPostById(params.data.id);

  return res.send(post);
});

posts.get("/:id/replies", checkAuthenticated, async (req, res) => {
  const params = z.object({ id: z.string().uuid() }).safeParse(req.params);

  if (!params.success) {
    return res.status(404).send({ message: "Post not found." });
  }

  const replies = await getPostReplies(params.data.id);

  if (!replies.success) {
    return res.status(500).send({ message: "Couldn't get posts." });
  }

  return res.send(replies.data);
});

posts.post("/:id/reply", checkAuthenticated, async (req, res) => {
  const params = z.object({ id: z.string().uuid() }).safeParse(req.params);

  if (!params.success) {
    return res.status(404).send({ message: "Post not found." });
  }

  const body = z
    .object({
      content: z.string().min(1),
    })
    .safeParse(req.body);

  if (!body.success) {
    return res.status(403).send({
      message: "You have to provide userId, postId and content of the post.",
    });
  }

  const result = await replyToPost(
    req.user.id,
    params.data.id,
    body.data.content,
  );

  return res.send(result);
});
