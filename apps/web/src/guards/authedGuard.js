import { useAuthStore } from "~/store/authStore";

/** @type {import("vue-router").NavigationGuardWithThis<undefined>} */
export const isAuthed = (_to, _from, next) => {
  const store = useAuthStore();

  if (!!store.user) next();
  else next("/auth");
};

/** @type {import("vue-router").NavigationGuardWithThis<undefined>} */
export const isUnauthed = (_to, _from, next) => {
  const store = useAuthStore();

  console.log(store.user);

  if (!store.user) next();
  else next("/home");
};
