<script setup>
import LoginForm from "~/components/LoginForm.vue";
import RegisterForm from "~/components/RegisterForm.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>
