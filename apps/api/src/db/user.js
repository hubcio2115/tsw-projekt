import { z } from "zod";

import { postSchema } from "~/validators/post.js";
import { userSchema } from "~/validators/user.js";

import { driver } from "./db.js";

/**
 * @param {string} username
 */
export async function getUserByName(username) {
  const session = driver.session();

  const result = (
    await session.run(
      `MATCH (u:User { username: $username })
      RETURN {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        password: u.password
      } as user;`,
      { username },
    )
  ).records.at(0);

  session.close();

  const userData = result?.get("user");

  return userSchema.safeParse(userData);
}

/**
 * @param {string} userId
 */
export async function getUserById(userId) {
  const session = driver.session();

  const result = (
    await session.run(
      `MATCH (u:User { id: $userId })
      RETURN {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        bio: u.bio
      } AS user;`,
      { userId },
    )
  ).records.at(0);

  session.close();

  return userSchema.safeParse(result?.get("user"));
}

/**
 * @param {Omit<import('~/validators/user.js').User, "id">} newUser
 */
export async function createUser({
  lastName,
  firstName,
  username,
  email,
  password,
}) {
  const session = driver.session();

  const result = (
    await session.run(
      `MERGE (u:User { id: $id })
    ON CREATE SET u.createdAt = datetime(),
    u.firstName = $firstName, 
    u.lastName = $lastName,
    u.username = $username,
    u.email = $email,
    u.password = $password
    RETURN { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, username: u.username } as user;
    `,
      {
        id: crypto.randomUUID(),
        firstName,
        lastName,
        username,
        email,
        password,
      },
    )
  ).records.at(0);

  return userSchema.safeParse(result?.get("user"));
}

/**
 * @param {string} userId
 */
export async function getAllUsers(userId) {
  const session = driver.session();

  const records = (
    await session.run(
      `MATCH (u:User)
      WHERE u.id <> $userId
      RETURN {
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName
      } as user;`,
      { userId },
    )
  ).records;

  session.close();

  const users = records.map((record) => {
    return userSchema.parse(record.get("user"));
  });

  return users;
}

/**
 * @param {string} userId
 * @param {string} targetUserId
 */
export async function followUser(userId, targetUserId) {
  const session = driver.session();

  const res = await session.run(
    `MATCH (u:User { id: $userId })
    MATCH (u1:User { id: $targetUserId })
    MERGE (u)-[f:FOLLOWS]->(u1)
    ON CREATE SET f.createdAt = datetime();`,
    { userId, targetUserId },
  );

  session.close();

  return res;
}

/**
 * @param {string} userId
 * @param {string} targetUserId
 */
export async function unfollowUser(userId, targetUserId) {
  const session = driver.session();

  const res = await session.run(
    `MATCH (u:User { id: $userId })
    MATCH (u1:User { id: $targetUserId })
    MATCH (u)-[f:FOLLOWS]-(u1)
    DELETE f;`,
    { userId, targetUserId },
  );

  session.close();

  return res;
}

/**
 * @param {string} userId
 * @param {string} targetUserId
 * @returns {Promise<boolean>} isFollowing
 */
export async function isFollowing(userId, targetUserId) {
  const session = driver.session();

  const res = (
    await session.run(
      `MATCH (u:User { id: $userId })
      MATCH (u1:User { id: $targetUserId })
      WITH u, u1
      OPTIONAL MATCH (u)-[r:FOLLOWS]->(u1)
      RETURN r IS NOT NULL AS isFollowing;`,
      {
        userId,
        targetUserId,
      },
    )
  ).records.at(0);

  session.close();

  return res?.get("isFollowing") ?? false;
}

/**
 * @param {string} userId
 */
export async function getUserPosts(userId) {
  const session = driver.session();

  const records = (
    await session.run(
      `MATCH (p:Post)<-[:POSTED]-(u:User { id: $userId })
       OPTIONAL MATCH (p)-[:QUOTES]->(p1:Post)
       OPTIONAL MATCH (p1)<-[:POSTED]-(u1)
       RETURN {
        id: p.id,
        content: p.content
      } AS post, {
        id: p1.id,
        content: p1.content,
        user: {
          id: u1.id,
          email: u1.email,
          firstName: u1.firstName,
          lastName: u1.lastName,
          username: u1.username
        }
      } AS quotedPost, {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username
      } AS user;`,
      {
        userId,
      },
    )
  ).records;

  session.close();

  const posts = records.map((record) => {
    const quotedPost = record.get("quotedPost");

    return {
      user: record.get("user"),
      post: {
        ...record.get("post"),
        quotedPost: quotedPost.id !== null ? quotedPost : null,
      },
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

/**
 * @param {string} userId
 */
export async function getUserHome(userId) {
  const session = driver.session();

  const records = (
    await session.run(
      `MATCH (u:User {id: $userId })-[f:FOLLOWS]->(u1:User)
      MATCH (u1)-[:POSTED]->(p:Post)
      WHERE p.createdAt >= f.createdAt
      OPTIONAL MATCH (p)-[:QUOTES]->(p1:Post)
      OPTIONAL MATCH (p1)<-[:POSTED]-(u1:User)
      RETURN {
        id: u1.id,
        email: u1.email,
        firstName: u1.firstName,
        lastName: u1.lastName,
        username: u1.username
      } AS user, {
        id: p.id,
        content: p.content
      } AS post, {
        id: p1.id,
        content: p1.content,
        user: {
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          username: u.username
        }
      } as quotedPost;`,
      { userId },
    )
  ).records;

  session.close();

  const data = records.map((record) => {
    const quotedPost = record.get("quotedPost");

    return {
      user: record.get("user"),
      post: {
        ...record.get("post"),
        quotedPost: quotedPost.id !== null ? quotedPost : null,
      },
    };
  });

  const posts = z
    .array(
      z.object({
        user: userSchema,
        post: postSchema,
      }),
    )
    .parse(data);

  return posts;
}

/**
 * @param {string} userId
 * @param {string} bio
 */
export async function updateUserBio(userId, bio) {
  const session = driver.session();

  const res = (
    await session.run(
      `MATCH (u:User { id: $userId })
      SET u.bio = $bio
      RETURN {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username
      } AS user; `,
      { userId, bio },
    )
  ).records.at(0);

  session.close();

  const user = userSchema.safeParse(res?.get("user"));

  return user;
}
