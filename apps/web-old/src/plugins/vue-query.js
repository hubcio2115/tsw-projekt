// Nuxt 3 app aliases
import { defineNuxtPlugin, useState } from "#imports";
import {
  QueryClient,
  VueQueryPlugin,
  dehydrate,
  hydrate,
} from "@tanstack/vue-query";

export default defineNuxtPlugin((nuxt) => {
  /** @type {globalThis.Ref<import("@tanstack/vue-query").DehydratedState | null>} */
  const vueQueryState = useState("vue-query");

  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } },
  });

  /** @type {import("@tanstack/vue-query").VueQueryPluginOptions} */
  const options = { queryClient };

  nuxt.vueApp.use(VueQueryPlugin, options);

  if (process.server) {
    nuxt.hooks.hook("app:rendered", () => {
      vueQueryState.value = dehydrate(queryClient);
    });
  }

  if (process.client) {
    hydrate(queryClient, vueQueryState.value);
  }
});
