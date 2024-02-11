<script setup>
import { createSubmitHandler } from "@vue-hooks-form/core";
import axios from "axios";

import LoginForm from "~/components/LoginForm.vue";
import RegisterForm from "~/components/RegisterForm.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { env } from "~/env.mjs";

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
  <div class="flex min-h-screen items-center justify-center gap-72 xl:gap-96">
    <h1 class="hidden text-[420px] font-bold lg:block">𝕐</h1>

    <div class="w-full p-2 md:w-auto">
      <h2 class="mb-2 text-3xl font-bold lg:mb-6 lg:text-6xl">Happening now</h2>

      <div class="flex w-full flex-col gap-4">
        <h3 class="text-2xl font-bold lg:text-3xl">Join today.</h3>

        <Tabs :default-value="'login'" class="w-full md:w-[400px]">
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
