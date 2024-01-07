import { NuxtAuthHandler } from "#auth";
import { useRuntimeConfig } from "#imports";

import { env } from "~/env.mjs";

// The #auth virtual import comes from this module. You can use it on the client
// and server side, however not every export is universal. For example do not
// use sign-in and sign-out on the server side.

const runtimeConfig = useRuntimeConfig();

// Refer to Auth.js docs for more details
/** @type {import('@auth/core/types').AuthConfig} */
export const authOptions = {
  secret: env.NUXTAUTH_SECRET,
  providers: [],
};

export default NuxtAuthHandler(authOptions, runtimeConfig);
// If you don't want to pass the full runtime config,
//  you can pass something like this: { public: { authJs: { baseUrl: "" } } }
