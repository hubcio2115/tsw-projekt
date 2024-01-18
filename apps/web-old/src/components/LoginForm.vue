<script setup>
import { useAuth } from "#imports";
import {
  createErrorHandler,
  createSubmitHandler,
  useForm,
} from "@vue-hooks-form/core";
import { useZodResolver } from "@vue-hooks-form/zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { authSchema } from "~/lib/validators/user";

const { signIn, status } = useAuth();

const {
  register,
  formState: { errors },
  handleSubmit,
  getValues,
} = useForm({
  defaultValues: {
    name: "",
    password: "",
  },
  resolver: useZodResolver(authSchema),
});

const onSubmit = createSubmitHandler(async () => {
  await signIn("credentials", {
    name: getValues("name").name,
    password: getValues("password").password,

    redirect: true,
    callbackUrl: "/",
  });
});

const onError = createErrorHandler((errors) => {
  console.log(errors);
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Login</CardTitle>

      <CardDescription> Fill the fields to login. </CardDescription>
    </CardHeader>

    <form @submit.prevent="handleSubmit(onSubmit, onError)()">
      <CardContent class="space-y-2">
        <div class="space-y-1">
          <Label for="name">Username</Label>

          <ClientOnly>
            <template #fallback>
              <Input id="name" disabled />
            </template>

            <div>
              <Input
                id="username"
                :="register('name')"
                :class="
                  cn(
                    errors.name
                      ? 'border-red-500 focus-visible:outline-red-500'
                      : '',
                  )
                "
              />

              <p v-if="errors.name" class="mt-2 text-sm text-red-500">
                {{ errors.name.message }}
              </p>
            </div>
          </ClientOnly>
        </div>

        <div class="space-y-1">
          <Label for="password">Password</Label>

          <ClientOnly>
            <template #fallback>
              <Input id="password" type="password" disabled />
            </template>

            <div>
              <Input
                id="password"
                type="password"
                :="register('password')"
                :class="
                  cn(
                    errors.password
                      ? 'border-red-500 focus-visible:outline-red-500'
                      : '',
                  )
                "
              />

              <p v-if="errors.password" class="mt-2 text-sm text-red-500">
                {{ errors.password.message }}
              </p>
            </div>
          </ClientOnly>
        </div>
      </CardContent>

      <CardFooter class="flex justify-end">
        <Button type="submit" :spinner="status === 'loading'">Login</Button>
      </CardFooter>
    </form>
  </Card>
</template>
