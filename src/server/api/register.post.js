import { createError, defineEventHandler, readBody } from "#imports";

import { registerSchema } from "~/lib/validators/user";
import { createUser, getUserByUsername } from "~/server/db/user";

export default defineEventHandler(async (event) => {
  /** @type {unknown} */
  const body = await readBody(event);

  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    throw createError({
      statusCode: 422,
      statusMessage:
        "You have to provide username, email, password and confirmation password.",
    });
  }

  const data = parsedBody.data;

  const optionalUser = await getUserByUsername(data.username);

  if (optionalUser.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "User with this username already exists.",
    });
  }

  await createUser(data);

  return;
});
