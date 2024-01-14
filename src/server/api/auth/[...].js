import { NuxtAuthHandler } from "#auth";
import { useRuntimeConfig } from "#imports";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import { Neo4jAdapter } from "@auth/neo4j-adapter";
import { verify } from "argon2";

import { env } from "~/env.mjs";

import { neo4jSession } from "../../db/db";

// The #auth virtual import comes from this module. You can use it on the client
// and server side, however not every export is universal. For example do not
// use sign-in and sign-out on the server side.

const runtimeConfig = useRuntimeConfig();

// Refer to Auth.js docs for more details
/** @type {import('@auth/core/types').AuthConfig} */
export const authOptions = {
  secret: env.NUXTAUTH_SECRET,
  adapter: Neo4jAdapter(neo4jSession),
  trustHost: true,

  callbacks: {
    jwt({ token, user }) {
      console.log("user:", user);
      console.log("token:", token);

      return token;
    },

    session({ session }) {
      console.log(session);
      return session;
    },
  },

  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        name: {},
        password: {},
      },

      async authorize(credentials) {
        const { name, password } = credentials;

        if (typeof name !== "string" || typeof password !== "string")
          throw new Error("Provided credentials couldn't be parsed.");

        const query = await neo4jSession.run(
          "MATCH (u:User { username: $username }) RETURN u.id, u.username, u.email, u.password",
          { username: name },
        );

        if (!query.records[0]?.toObject()) throw new Error("User not found.");

        const userPassword = query.records[0].get("u.password");
        const arePasswordSame = await verify(userPassword, password);
        if (!arePasswordSame) throw new Error("Wrong password.");

        /** @type {import("~/lib/validators/user").User} */
        const user = {
          id: query.records[0]?.get("u.id"),
          name: query.records[0]?.get("u.username"),
          email: query.records[0]?.get("u.email"),
        };

        return user;
      },
    }),
  ],
};

export default NuxtAuthHandler(authOptions, runtimeConfig);
// If you don't want to pass the full runtime config,
// you can pass something like this: { public: { authJs: { baseUrl: "" } } }
