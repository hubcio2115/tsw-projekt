<script setup>
import { getInitials } from "~/lib/utils";
import { postSchema } from "~/lib/validators/post";
import { userSchema } from "~/lib/validators/user";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

/**
 * @type {{poster: import("~/lib/validators/user").User, post: import("~/lib/validators/post").Post}} QuoteComponentProps
 */
// @ts-expect-error The typed value is all good
const props = defineProps({
  poster: {
    type: Object,
    required: true,
    validator: (value) => {
      return userSchema.safeParse(value).success;
    },
  },

  post: {
    type: Object,
    required: true,
    validator: (value) => {
      return postSchema.safeParse(value).success;
    },
  },
});

const initials = getInitials(props.poster.firstName, props.poster.lastName);
</script>

<template>
  <div class="flex gap-2 rounded-md border border-primary p-4">
    <Avatar class="h-8 w-8 cursor-pointer">
      <AvatarImage alt="profile-picture" />
      <AvatarFallback>{{ initials }}</AvatarFallback>
    </Avatar>

    <div class="w-full">
      <div class="flex cursor-pointer gap-1">
        <span class="cursor-pointer text-base font-bold hover:underline">
          {{ poster.firstName }} {{ poster.lastName }}
        </span>

        <span class="text-base font-normal text-gray-500"
          >@{{ poster.username }}</span
        >
      </div>

      <p class="w-full text-base">
        {{ props.post.content }}
      </p>
    </div>
  </div>
</template>
