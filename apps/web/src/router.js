import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "~/layouts/MainLayout.vue";
import Auth from "~/pages/AuthPage.vue";
import Home from "~/pages/HomePage.vue";
import Post from "~/pages/PostPage.vue";
import Profile from "~/pages/ProfilePage.vue";
import UserDetails from "~/pages/UserDetailsPage.vue";

import { isAuthed, isUnauthed } from "./guards/authedGuard";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/auth",
      name: "Auth",
      component: Auth,
      meta: { title: "𝕐. It's what's happening / 𝕐" },
      beforeEnter: [isUnauthed],
    },
    {
      path: "/",
      component: MainLayout,
      redirect: "/home",
      children: [
        {
          path: "home",
          name: "Home",
          component: Home,
          meta: { title: "Home / 𝕐" },
          beforeEnter: [isAuthed],
        },
        {
          path: ":id",
          name: "Profile",
          component: Profile,
          beforeEnter: [isAuthed],
        },
        {
          path: ":id/posts/:postId",
          name: "Post",
          component: Post,
          beforeEnter: [isAuthed],
        },
        {
          path: "details",
          name: "UserDetails",
          component: UserDetails,
          beforeEnter: [isAuthed],
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  // @ts-expect-error title is present from the router meta
  document.title = to.meta.title ?? "𝕐. It's what's happening / 𝕐";
});
