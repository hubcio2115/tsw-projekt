import { env } from "./src/env.mjs";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "./src/",

  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxtjs/tailwindcss", // [
    //   "@nuxtjs/eslint-module",
    //   {
    //     lintOnStart: false,
    //   },
    // ],
    ["@hebilicious/authjs-nuxt", { guestRedirectTo: "/auth" }],
    "@nuxt/image",
  ],

  alias: {
    cookie: "cookie",
  },

  runtimeConfig: {
    authJs: {
      secret: env.NUXTAUTH_SECRET,
    },

    public: {
      authJs: {
        baseUrl: env.NUXT_PUBLIC_NUXTAUTH_URL,
        verifyClientOnEveryRequest: true,
      },
    },
  },
});
