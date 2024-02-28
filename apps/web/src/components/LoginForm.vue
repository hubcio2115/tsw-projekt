<script setup>
import {
  createErrorHandler,
  createSubmitHandler,
  useForm,
} from "@vue-hooks-form/core";
import { useZodResolver } from "@vue-hooks-form/zod";
import axios from "axios";
import { useRouter } from "vue-router";

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
import { authSchema, userSchema } from "~/lib/validators/user";
import { useAuthStore } from "~/store/authStore";

const store = useAuthStore();
const router = useRouter();

const {
  register,
  formState: { errors },
  handleSubmit,
  getValues,
} = useForm({
  defaultValues: {
    username: "",
    password: "",
  },
  resolver: useZodResolver(authSchema),
});

const onSubmit = createSubmitHandler(async () => {
  const data = {
    username: getValues("username").username,
    password: getValues("password").password,
  };

  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
    data,
    {
      withCredentials: true,
    },
  );

  if (res.status >= 200 || res.status <= 299) {
    const data = await res.data;

    const user = userSchema.parse(data);

    store.setUser(user);

    router.push({ path: "/home" });
  }
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

          <div>
            <Input
              id="username"
              :="register('username')"
              :class="
                cn(
                  errors.username
                    ? 'border-red-500 focus-visible:outline-red-500'
                    : '',
                )
              "
            />

            <p v-if="errors.username" class="mt-2 text-sm text-red-500">
              {{ errors.username.message }}
            </p>
          </div>
        </div>

        <div class="space-y-1">
          <Label for="password">Password</Label>

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
        </div>
      </CardContent>

      <CardFooter class="flex justify-end">
        <Button type="submit">Login</Button>
      </CardFooter>
    </form>
  </Card>
</template>
