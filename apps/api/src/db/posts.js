import { z } from "zod";

import { postSchema } from "~/validators/post.js";
import { userSchema } from "~/validators/user.js";

import { driver } from "./db.js";

/**
 * @param {string} userId
 * @param {string} content
 */
export async function createPost(userId, content) {
  const session = driver.session();

  const res = (
    await session.run(
      `MERGE (p:Post { id: $id })
      ON CREATE SET p.createdAt = datetime(), p.content = $content
      WITH p
      MATCH (u:User { id: $userId })
      MERGE (u)-[:POSTED]->(p)
      RETURN { id: p.id, content: p.content } as post;`,
      {
        id: crypto.randomUUID(),
        content,
        userId,
      },
    )
  ).records.at(0);

  session.close();

  const post = postSchema.safeParse(res?.get("post"));

  return post;
}

/**
 * @param {string} userId
 * @param {string} postId
 * @param {string} content
 */
export async function createQuote(userId, postId, content) {
  const session = driver.session();

  const res = (
    await session.run(
      `MERGE (p:Post { id: $id })
      ON CREATE SET p.createdAt = datetime(), p.content = $content
      WITH p
      MATCH (u:User { id: $userId })-[:POSTED]->(p1:Post { id: $postId })
      MERGE (u)-[:POSTED]->(p)
      MERGE (p)-[:QUOTES]->(p1)
      RETURN { id: p.id, content: p.content } as post;`,
      {
        id: crypto.randomUUID(),
        content,
        userId,
        postId,
      },
    )
  ).records.at(0);

  session.close();

  const post = postSchema.parse(res?.get("post"));

  return post;
}

/**
 * @param {string} id
 */
export async function getPostById(id) {
  const session = driver.session();

  const res = (
    await session.run(
      `MATCH (p:Post { id: $id })<-[:POSTED]-(u:User)
      OPTIONAL MATCH (p)-[:QUOTES]->(p1:Post)
      OPTIONAL MATCH (p)-[:REPLIES*1..]->(p2)
      OPTIONAL MATCH (p2)<-[:POSTED]-(u2:User)
      WITH p, p1, p2, u, u2
      OPTIONAL MATCH (p1)<-[:POSTED]-(u1:User)
      WITH p, p1, p2, u, u1, u2
      RETURN { 
        id: p.id, 
        content: p.content 
      } AS post,
      { 
        id: u.id, 
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username, 
        email: u.email 
      } AS user, 
      CASE 
        WHEN p1.id IS NOT NULL AND u1.id IS NOT NULL 
        THEN { 
          id: p1.id,
          content: p1.content, 
          user: { id: u1.id, firstName: u1.firstName, lastName: u1.lastName, username: u1.username, email: u1.email } 
        }
        ELSE NULL 
      END AS quote,
      COLLECT(DISTINCT { 
        reply: { id: p2.id, content: p2.content }, 
        user: { id: u2.id, firstName: u2.firstName, lastName: u2.lastName, username: u2.username, email: u2.email }
      }) AS replies;`,
      {
        id,
      },
    )
  ).records.at(0);

  const replies = res?.get("replies");

  const firstReply = replies.at(0);

  if (firstReply?.reply?.id !== null) {
    const res = (
      await session.run(
        `MATCH (p:Post { id: $postId })<-[:POSTED]-(u:User)
        OPTIONAL MATCH (p)-[:QUOTES]->(p1)
        OPTIONAL MATCH (p1)<-[:POSTED]-(u1)
        WITH p, u, p1, u1
        RETURN
        CASE
          WHEN p1.id IS NOT NULL AND u1.id IS NOT NULL
          THEN {
            reply: {
              id: p.id,
              content: p.content,
              quotedPost: {
                id: p1.id,
                content: p1.content,
                user: { id: u1.id, firstName: u1.firstName, lastName: u1.lastName, username: u1.username, email: u1.email } 
              }
            },
            user: { id: u.id, firstName: u.firstName, lastName: u.lastName, username: u.username, email: u.email } 
          }
          ELSE NULL
        END as quote;`,
        {
          postId: firstReply.reply.id,
        },
      )
    ).records.at(0);

    const quote = res?.get("quote");

    if (quote !== null) {
      replies[0] = quote;
    }
  }

  session.close();

  const quotedPost = res?.get("quote");

  const post = postSchema.parse({ ...res?.get("post"), quotedPost });

  return {
    post,
    replies: replies[0]?.reply?.id !== null ? replies : null,
  };
}

/**
 * @param {string} id
 */
export async function getPostByIdWithUser(id) {
  const session = driver.session();

  const res = (
    await session.run(
      `MATCH (p:Post { id: $id })<-[:POSTED]-(u:User)
      OPTIONAL MATCH (p)-[:QUOTES]->(p1:Post)
      OPTIONAL MATCH (p1)<-[:POSTED]-(u1:User)
      RETURN { id: p.id, content: p.content } as post,
      {
        id: p1.id, 
        content: p1.content,
        user: { id: u1.id, firstName: u1.firstName, lastName: u1.lastName, username: u1.username, email: u1.email }
      } as quotedPost,
      { id: u.id, firstName: u.firstName, lastName: u.lastName, username: u.username, email: u.email } as user`,
      {
        id,
      },
    )
  ).records.at(0);

  session.close();

  const user = userSchema.parse(res?.get("user"));

  const quotedPost = res?.get("quotedPost");

  const post = postSchema.parse({
    ...res?.get("post"),
    quotedPost: quotedPost.id ? quotedPost : null,
  });

  return { post, user };
}

/**
 * @param {string} userId
 * @param {string} postId
 * @param {string} content
 */
export async function replyToPost(userId, postId, content) {
  const session = driver.session();

  const res = (
    await session.run(
      `MATCH (p:Post { id: $postId })
    MATCH (u:User { id: $userId })
    WITH p, u
    MERGE (p1:Post { id: $newPostId}) 
    ON CREATE SET p1.createdAt = datetime(), p1.content = $content
    MERGE (p1)<-[:POSTED]-(u)
    MERGE (p)<-[:REPLIES]-(p1)
    RETURN { id: p1.id, content: p1.content } as post,
    { id: u.id, firstName: u.firstName, lastName: u.lastName, username: u.username, email: u.email } as user;`,
      {
        postId,
        userId,
        newPostId: crypto.randomUUID(),
        content,
      },
    )
  ).records.at(0);

  session.close();

  const user = userSchema.parse(res?.get("user"));

  const post = postSchema.parse(res?.get("post"));

  return {
    user,
    post,
  };
}

/**
 * @param {string} postId
 */
export async function getPostReplies(postId) {
  const session = driver.session();

  const res = (
    await session.run(
      `MATCH (p:Post { id: $postId })<-[:REPLIES]-(p1)
      MATCH (p1)<-[:POSTED]-(u)
      RETURN { id: p1.id, content: p1.content } as post,
      { id: u.id, firstName: u.firstName, lastName: u.lastName, username: u.username, email: u.email } as user;`,
      { postId },
    )
  ).records;

  session.close();

  const posts = res.map((entry) => {
    const user = entry.get("user");

    const post = entry.get("post");

    return {
      user,
      post,
    };
  });

  const parsedPosts = z
    .array(
      z.object({
        user: userSchema,
        post: postSchema,
      }),
    )
    .safeParse(posts);

  return parsedPosts;
}
