import { defineStore } from "pinia";

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useAuthStore = defineStore("auth", () => {
  const userFromStorage = localStorage.getItem("user");

  let user = $ref(
    userFromStorage !== null
      ? /** @type {import('~/lib/validators/user').User}  */ (
          JSON.parse(userFromStorage)
        )
      : null,
  );

  /** @param {import("~/lib/validators/user").User} newUser */
  function setUser(newUser) {
    user = newUser;

    localStorage.setItem("user", JSON.stringify(newUser));
  }

  function unsetUser() {
    user = null;

    localStorage.removeItem("user");
  }

  return { user, setUser, unsetUser };
});
