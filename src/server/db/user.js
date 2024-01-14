import { hash } from "argon2";

import { userSchema } from "~/lib/validators/user";

import { neo4jSession } from "./db";

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
 * @param {import("~/lib/validators/user").AuthUser} newUser
 */
export async function createUser({ username, password, email }) {
  const hashedPassword = await hash(password);

  await neo4jSession.run(
    "CREATE (u:User {id: $id, email: $email, password: $password, username: $username})",
    { id: crypto.randomUUID(), username, password: hashedPassword, email },
  );
}
