<script setup>
import { useRoute, useRouter, useState } from "#imports";

import LoginForm from "~/components/LoginForm";
import RegisterForm from "~/components/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const route = useRoute();
const router = useRouter();

if (!route.query?.tab) {
  void router.push({ query: { tab: "login" } });
}

// @ts-expect-error TypeScript thinks this type assertion is a mistake it's not
const tab = /** @type {Ref<"login" | "register">} */ (
  useState("tab", () => route.query?.tab ?? "login")
);
</script>

<template>
  <div class="flex min-h-screen justify-center pt-96">
    <Tabs :default-value="tab" class="w-[400px]">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="login"> Login </TabsTrigger>

        <TabsTrigger value="register"> Register </TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <LoginForm />
      </TabsContent>

      <TabsContent value="register">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  </div>
</template>
