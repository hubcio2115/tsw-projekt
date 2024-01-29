import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "~/layouts/MainLayout.vue";
import Auth from "~/pages/AuthPage.vue";
import Home from "~/pages/HomePage.vue";
import Post from "~/pages/PostPage.vue";
import Profile from "~/pages/ProfilePage.vue";

import { isAuthed, isUnauthed } from "./guards/authedGuard";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/auth",
      name: "Auth",
      component: Auth,
      meta: { title: "𝕐. It's what's happening / 𝕐" },
      beforeEnter: isUnauthed,
    },
    {
      path: "/",
      component: MainLayout,
      beforeEnter: isAuthed,
      children: [
        {
          path: "/",
          name: "Home",
          component: Home,
          meta: { title: "Home / 𝕐" },
        },
        {
          path: "/:id",
          name: "Profile",
          component: Profile,
          meta: {},
        },
        {
          path: "/:id/posts/:postId",
          name: "Post",
          component: Post,
          meta: {},
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  // @ts-expect-error title is present from the router meta
  document.title = to.meta.title ?? "𝕐. It's what's happening / 𝕐";
});
