import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3, "Username has to be longer than 3 characters"),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  bio: z.string().optional(),
});

/** @typedef {z.infer<typeof userSchema>} User */

export const authSchema = userSchema.omit({ id: true }).extend({
  password: z.string().min(8, "Password has to have at least 8 characters"),
});

/** @typedef {z.infer<typeof authSchema>} AuthUser */
