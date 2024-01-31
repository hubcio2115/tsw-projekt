<script setup>
import { useQuery } from "@tanstack/vue-query";
import { createSubmitHandler } from "@vue-hooks-form/core";
import axios from "axios";
import { useRoute } from "vue-router";

import LoginForm from "~/components/LoginForm.vue";
import RegisterForm from "~/components/RegisterForm.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { env } from "~/env.mjs";
import { userSchema } from "~/lib/validators/user";

const route = useRoute();

const { data: userProfile, isPending: isUserProfilePending } = useQuery({
  queryKey: ["userProfile", route.params.id],
  queryFn: async ({ queryKey: [_, userId] }) => {
    const res = await axios.get(
      `${env.VITE_API_BASE_URL}/api/users/${userId}`,
      { withCredentials: true },
    );

    if (res.status >= 200 || res.status <= 299) {
      const data = res.data;

      return userSchema.parse(data);
    }

    return null;
  },
});

const onSubmit =
  /** @type {typeof createSubmitHandler<import("~/lib/validators/user").AuthUser>}*/ (
    createSubmitHandler
  )(async (data) => {
    const res = await axios.post(
      `${env.VITE_API_BASE_URL}/api/auth/register`,
      data,
      { withCredentials: true },
    );

    if (res.status >= 200 || res.status <= 299) {
      location.reload();
    }
  });
</script>

<template>
  <div class="flex min-h-screen items-center justify-center gap-96">
    <Head>
      <Title>Y. It's what's happening / Y</Title>
    </Head>

    <h1 class="text-[420px] font-bold">𝕐</h1>

    <div>
      <h2 class="mb-6 text-6xl font-bold">Happening now</h2>

      <div class="flex flex-col gap-4">
        <h3 class="text-3xl font-bold">Join today.</h3>

        <Tabs :default-value="'login'" class="w-[400px]">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="login"> Login </TabsTrigger>

            <TabsTrigger value="register"> Register </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm @on-submit="onSubmit" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>
