import { hash } from "argon2";

import { userSchema } from "~/validators/user.js";

import { neo4jSession } from "./db.js";

/**
 * @param {string} id
 */
export async function getUserById(id) {
  const query = await neo4jSession.run(
    `MATCH (u:User { id: $id }) RETURN u.id, u.username, u.email`,
    { id },
  );

  const record = query.records.at(0);

  const userData = {
    id: record?.get("u.id"),
    username: record?.get("u.username"),
    email: record?.get("u.email"),
  };

  const optionalUser = userSchema.safeParse(userData);

  return optionalUser;
}

/**
 * @param {string} username
 */
export async function getUserByUsername(username) {
  const query = await neo4jSession.run(
    `MATCH (u:User { username: $username }) RETURN u.id, u.username, u.email`,
    { username },
  );

  const record = query.records.at(0);

  const userData = {
    id: record?.get("u.id"),
    username: record?.get("u.username"),
    email: record?.get("u.email"),
  };

  const optionalUser = userSchema.safeParse(userData);

  return optionalUser;
}

/**
 * @param {import("~/validators/user.js").AuthUser} newUser
 */
export async function createUser({ name, password, email }) {
  const hashedPassword = await hash(password);

  await neo4jSession.run(
    "MERGE (u:User {id: $id, email: $email, password: $password, username: $name})",
    { id: crypto.randomUUID(), name, password: hashedPassword, email },
  );
}

/**
 * @param {import("~/validators/user.js").User["id"]} userId
 * @param {import("~/validators/user.js").User["id"]} targetUserId
 */
export async function followUser(userId, targetUserId) {
  return await neo4jSession.run(
    "MATCH (u1:User {id: $userId}) MATCH (u2: User {id: $targetUserId}) MERGE (u1)-[:FOLLOWS]->(u2)",
    { userId, targetUserId },
  );
}

/**
 * @param {import("~/validators/user.js").User["id"]} userId
 * @param {import("~/validators/user.js").User["id"]} targetUserId
 */
export async function unfollowUser(userId, targetUserId) {
  return await neo4jSession.run(
    "MATCH (u1:User {id: $userId})-[f:FOLLOWS]->(u2: User {id: $targetUserId}) DELETE f",
    { userId, targetUserId },
  );
}
