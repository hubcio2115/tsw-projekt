import { z } from "zod";

import { userSchema } from "./user.js";

export const postSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Post should have at least 1 character."),
  quotedPost: z
    .object({
      id: z.string(),
      content: z.string().min(1, "Post should have at least 1 character."),
      user: userSchema,
    })
    .nullish(),
});

/** @typedef {z.infer<typeof postSchema>} Post */
