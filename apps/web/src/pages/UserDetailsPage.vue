<script setup>
import { useMutation } from "@tanstack/vue-query";
import { createSubmitHandler } from "@vue-hooks-form/core";
import axios from "axios";

import RegisterForm from "~/components/RegisterForm.vue";
import { env } from "~/env.mjs";
import { userSchema } from "~/lib/validators/user";
import { useAuthStore } from "~/store/authStore";

const store = useAuthStore();

const { mutate: detailsMutation } =
  /** @type {typeof useMutation<import("~/lib/validators/user").User | null, Error, import("~/lib/validators/user").AuthUser>} */ (
    useMutation
  )({
    mutationKey: ["user", "update"],
    mutationFn: async (newUser) => {
      const res = await axios.put(
        `${env.VITE_API_BASE_URL}/api/users/details`,
        newUser,
        { withCredentials: true },
      );

      if (res.status >= 200 || res.status <= 299) {
        const data = userSchema.parse(res.data);

        return data;
      }

      throw new Error(res.statusText);
    },

    onSuccess(data) {
      if (data) {
        store.setUser(data);
      }
    },

    onError(error) {
      console.error(error.message);
    },
  });

const onSubmit =
  /** @type {typeof createSubmitHandler<import("~/lib/validators/user").AuthUser>}*/ (
    createSubmitHandler
  )(async (data) => {
    detailsMutation(data);
  });
</script>

<template>
  <RegisterForm
    class="col-span-2"
    :default-values="{ ...store.user, password: '' }"
    title="User Details"
    description="Change user details here."
    button-label="update"
    @on-submit="onSubmit"
  />
</template>
