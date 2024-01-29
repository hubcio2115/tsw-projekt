<script setup>
import { storeToRefs } from "pinia";
import { z } from "zod";

import { DialogFooter } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { getInitials } from "~/lib/utils";
import { postSchema } from "~/lib/validators/post";
import { userSchema } from "~/lib/validators/user";
import { useAuthStore } from "~/store/authStore";

import QuoteComponent from "./QuoteComponent.vue";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const store = useAuthStore();
const { user } = storeToRefs(store);

/**
 * @type {{placeholder: string, quotedPost: {post: import("~/lib/validators/post").Post, poster: import("~/lib/validators/user").User } | null}} PostTextAreaProps
 */
// @ts-expect-error Wrong type inference
defineProps({
  placeholder: {
    type: String,
    required: true,
  },
  quotedPost: {
    type: Object,
    required: false,
    validator(value) {
      return z
        .object({
          post: postSchema,
          poster: userSchema,
        })
        .safeParse(value).success;
    },
    default: null,
  },
});

const emit = defineEmits({
  /**
   * @param {string} content
   */
  onSubmit(content) {
    if (content.length !== 0) return true;
    return false;
  },
});

let content = $ref("");

function onSubmit() {
  emit("onSubmit", content);
  content = "";
}

const initials = getInitials(user.value?.firstName, user.value?.lastName);
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <div class="mt-4 flex gap-4">
      <Avatar class="h-10 w-10">
        <AvatarImage alt="profile-picture" />
        <AvatarFallback>{{ initials }}</AvatarFallback>
      </Avatar>

      <Textarea
        v-model:value="content"
        :placeholder="placeholder"
        class="resize-none border-none"
      />
    </div>

    <QuoteComponent
      v-if="quotedPost"
      :post="quotedPost.post"
      :poster="quotedPost.poster"
    />

    <DialogFooter>
      <Button
        type="submit"
        class="justify-center rounded-full bg-blue-400 px-6 py-2 text-base font-bold text-white hover:bg-blue-500 hover:text-white focus-visible:outline-blue-400 disabled:opacity-50"
        :disabled="content.length === 0"
      >
        {{ quotedPost ? "Quote" : "Post" }}
      </Button>
    </DialogFooter>
  </form>
</template>
