import { useAuthStore } from "~/store/authStore";

/** @type {import("vue-router").NavigationGuardWithThis<undefined>} */
export const isAuthed = () => {
  const store = useAuthStore();

  if (!!store.user) return true;

  return { name: "Auth" };
};

/** @type {import("vue-router").NavigationGuardWithThis<undefined>} */
export const isUnauthed = () => {
  const store = useAuthStore();

  if (!store.user) return true;

  return { name: "Home" };
};
