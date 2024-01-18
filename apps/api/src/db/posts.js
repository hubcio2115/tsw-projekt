import { z } from "zod";

import { neo4jSession } from "./db";

const postSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
});

/** @typedef {z.infer<typeof postSchema>} Post */

/**
 * @param {import("~/lib/validators/user").User["id"]} userId
 * @param {Omit<Post, "id">} newPost
 */
export async function createPost(userId, { content }) {
  const res = (
    await neo4jSession.run(
      `
    MERGE (p:Post {id: $id})
    ON CREATE SET p.createdAt = datetime()
    SET p.content = $content
    MATCH (u:User {id: $userId})
    Merge (u)-[:POSTED]->(p)
    RETURN p;
`,
      {
        id: crypto.randomUUID(),
        content,
        userId,
      },
    )
  ).records.at(0);

  const post = postSchema.safeParse({
    id: res?.get("p.id"),
    content: res?.get("p.content"),
  });

  return post;
}

/**
 * @param {string} id
 */
export async function getPostById(id) {
  const res = (
    await neo4jSession.run("MATCH (p:Post {id: $id}) RETURN p", {
      id,
    })
  ).records.at(0);

  const post = postSchema.safeParse({
    id: res?.get("p.id"),
    content: res?.get("p.content"),
  });

  return post;
}

/**
 * @param {import("~/lib/validators/user").User["id"]} userId
 * @param {Post["id"]} postId
 * @param {Omit<Post, "id">} newPost
 * @returns {Promise<z.SafeParseReturnType<Post, Post>>} newPost
 */
export async function commentOnPost(userId, postId, { content }) {
  const newPost = await createPost(userId, { content });

  if (!newPost.success) return newPost;

  /** @type {string} */
  const newPostId = newPost.data.id;

  await neo4jSession.run(
    "MERGE (p1:Post {id: $postId})-[:COMMENTED]->(p2:Post {id: $newPostId}) RETURN p2",
    { postId, newPostId },
  );

  return newPost;
}

/**
 * @param {import("~/lib/validators/user").User["id"]} userId
 * @param {Post["id"]} postId
 * @param {Omit<Post, "id">} newPost
 * @returns {Promise<z.SafeParseReturnType<Post, Post>>} newPost
 */
export async function quotePost(userId, postId, { content }) {
  const newPost = await createPost(userId, { content });

  if (!newPost.success) return newPost;

  /** @type {string} */
  const newPostId = newPost.data.id;

  await neo4jSession.run(
    "MERGE (p1:Post {id: $postId})-[:QUOTED]->(p2:Post {id: $newPostId}) RETURN p2",
    { postId, newPostId },
  );

  return newPost;
}

/**
 * @param {Post["id"]} postId
 * @returns {Promise<z.SafeParseReturnType<Post, Post>>} newPost
 */
export async function deletePost(postId) {
  const res = (
    await neo4jSession.run(
      `MATCH (p:Post {id: $id}) DETACH DELETE p RETURN p;`,
      { postId },
    )
  ).records.at(0);

  const post = postSchema.safeParse({
    id: res?.get("p.id"),
    content: res?.get("p.content"),
  });

  return post;
}
