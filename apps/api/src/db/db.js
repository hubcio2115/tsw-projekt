import neo4j from "neo4j-driver";

import { env } from "~/env.mjs";

export const driver = neo4j.driver(
  "bolt://localhost",
  neo4j.auth.basic(env.DB_USERNAME, env.DB_PASSWORD),
);
