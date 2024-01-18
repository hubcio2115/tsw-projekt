import Home from "~/pages/Home.vue";
import Auth from "~/pages/Auth.vue";
import { createRouter, createWebHistory } from "vue-router";
import { document } from "postcss/lib/postcss";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home, meta: { title: "Home / 𝕐" } },
    {
      path: "/auth",
      component: Auth,
      meta: { title: "𝕐. It's what's happening / 𝕐" },
    },
  ],
});

router.beforeEach((to) => {
  document.title = to.meta.title ?? "𝕐";
});
