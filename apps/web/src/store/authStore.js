import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useAuthStore = defineStore("auth", () => {
  const userFromStorage = useStorage("user", localStorage.getItem("user"));

  const user = ref(
    userFromStorage.value !== null
      ? /** @type {import('~/lib/validators/user').User}  */ (
          JSON.parse(userFromStorage.value)
        )
      : null,
  );

  /** @param {import("~/lib/validators/user").User} newUser */
  function setUser(newUser) {
    user.value = newUser;

    userFromStorage.value = JSON.stringify(newUser);
  }

  function unsetUser() {
    user.value = null;

    userFromStorage.value = null;
  }

  return { user, setUser, unsetUser };
});
