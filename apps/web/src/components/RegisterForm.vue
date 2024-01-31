<script setup>
import { createErrorHandler, useForm } from "@vue-hooks-form/core";
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

/**
 * @type {{defaultValues: import("~/lib/validators/user").AuthUser | null, title: string, description: string, buttonLabel: string }} PostTextAreaProps
 */
// @ts-expect-error Wrong type inference
const props = defineProps({
  defaultValues: {
    type: Object,
    required: false,
    default: null,
    validator(value) {
      return authSchema.nullable().safeParse(value).success;
    },
  },
  title: {
    type: String,
    required: false,
    default: "Register",
  },
  description: {
    type: String,
    required: false,
    default: "Create your account here.",
  },
  buttonLabel: {
    type: String,
    required: false,
    default: "Register",
  },
});

const {
  register,
  handleSubmit,
  getValues,
  formState: { errors },
} = useForm({
  defaultValues: {
    username: props.defaultValues?.username ?? "",
    firstName: props.defaultValues?.firstName ?? "",
    lastName: props.defaultValues?.lastName ?? "",
    email: props.defaultValues?.email ?? "",
    password: props.defaultValues?.password ?? "",
  },
  resolver: useZodResolver(authSchema),
});

const onError = createErrorHandler((errors) => {
  console.error(errors);
});

const emit = defineEmits({
  /**
   * @param {import("~/lib/validators/user").AuthUser} user
   */
  onSubmit(user) {
    return authSchema.safeParse(user).success;
  },
});

function submit() {
  const data = {
    username: getValues("username").username,
    firstName: getValues("firstName").firstName,
    lastName: getValues("lastName").lastName,
    email: getValues("email").email,
    password: getValues("password").password,
  };

  emit("onSubmit", data);
}

const submitHandler = handleSubmit(submit, onError);
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>

      <CardDescription> {{ description }} </CardDescription>
    </CardHeader>

    <form @submit.prevent="submitHandler">
      <CardContent class="space-y-2">
        <div class="space-y-1">
          <Label for="name">Email</Label>

          <div>
            <Input
              id="email"
              :="register('email')"
              :class="
                cn(
                  errors.email
                    ? 'border-red-500 focus-visible:outline-red-500'
                    : '',
                )
              "
            />

            <p v-if="errors.email" class="mt-2 text-sm text-red-500">
              {{ errors.email.message }}
            </p>
          </div>
        </div>

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
          <Label for="name">First name</Label>

          <div>
            <Input
              id="firstName"
              :="register('firstName')"
              :class="
                cn(
                  errors.firstName
                    ? 'border-red-500 focus-visible:outline-red-500'
                    : '',
                )
              "
            />

            <p v-if="errors.firstName" class="mt-2 text-sm text-red-500">
              {{ errors.firstName.message }}
            </p>
          </div>
        </div>

        <div class="space-y-1">
          <Label for="name">Last name</Label>

          <div>
            <Input
              id="lastName"
              :="register('lastName')"
              :class="
                cn(
                  errors.lastName
                    ? 'border-red-500 focus-visible:outline-red-500'
                    : '',
                )
              "
            />

            <p v-if="errors.lastName" class="mt-2 text-sm text-red-500">
              {{ errors.lastName.message }}
            </p>
          </div>
        </div>

        <div class="space-y-1">
          <Label for="name">Password</Label>

          <div>
            <Input
              id="password"
              :="register('password')"
              type="password"
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
        <Button type="submit">{{ buttonLabel }}</Button>
      </CardFooter>
    </form>
  </Card>
</template>
