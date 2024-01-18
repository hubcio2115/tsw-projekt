<script setup>
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
import { registerSchema } from "~/lib/validators/user";

const {
  register,
  formState: { errors },
  handleSubmit,
} = useForm({
  defaultValues: {
    user: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
  resolver: useZodResolver(registerSchema),
});

const onSubmit = createSubmitHandler((data) => {
  console.log(data);
});

const onError = createErrorHandler((errors) => {
  console.log(errors);
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Register</CardTitle>

      <CardDescription> Create your account here. </CardDescription>
    </CardHeader>

    <form @submit.prevent="handleSubmit(onSubmit, onError)()">
      <CardContent class="space-y-2">
        <div class="space-y-1">
          <Label for="email">Email</Label>

          <ClientOnly>
            <template #fallback>
              <Input id="email" disabled />
            </template>

            <Input id="email" :="register('email')" />
          </ClientOnly>
        </div>

        <div class="space-y-1">
          <Label for="username">Username</Label>

          <ClientOnly>
            <template #fallback>
              <Input id="name" disabled />
            </template>

            <Input id="username" :="register('name')" />
          </ClientOnly>
        </div>

        <div class="space-y-1">
          <Label for="password">Password</Label>

          <ClientOnly>
            <template #fallback>
              <Input id="password" disabled />
            </template>

            <Input id="password" :="register('password')" />
          </ClientOnly>
        </div>

        <div class="space-y-1">
          <Label for="confirmPassword">Confirm Password</Label>

          <ClientOnly>
            <template #fallback>
              <Input id="confirmPassword" disabled />
            </template>

            <Input id="confirmPassword" :="register('confirmPassword')" />
          </ClientOnly>
        </div>
      </CardContent>

      <CardFooter class="flex justify-end">
        <Button type="submit">Register</Button>
      </CardFooter>
    </form>
  </Card>
</template>
