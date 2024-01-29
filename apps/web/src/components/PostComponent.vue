<script setup>
import { useMutation } from "@tanstack/vue-query";
import { PenLine } from "lucide-vue-next";
import { useRouter } from "vue-router";

import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { getInitials } from "~/lib/utils";
import { postSchema } from "~/lib/validators/post";
import { userSchema } from "~/lib/validators/user";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const router = useRouter();

/**
 * @type {{poster: import("~/lib/validators/user").User, post: import("~/lib/validators/post").Post}} PostComponentProps
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

const { mutate: createQuote } =
  /** @type {typeof useMutation<import("~/lib/validators/post").Post | null, Error, [string, string]>} */ (
    useMutation
  )({
    mutationKey: ["quote", "create"],
    mutationFn: async ([postId, content]) => {
      const res = await fetch("/api/posts/quote", {
        method: "POST",
        body: JSON.stringify({ postId, content }),
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const data = postSchema.parse(await res.json());

      return data;
    },

    onSuccess: (data, [userId]) => {
      router.push(`/${userId}/posts/${data?.id}`);
    },
  });

/**
 * @param {string} content
 */
function onSubmit(content) {
  createQuote([props.post.id, content]);
}

function navigateToPoster() {
  router.push(`/${props.poster.id}`);
}

function navigateToPost() {
  router.push(`/${props.poster.id}/posts/${props.post.id}`);
}

const initials = getInitials(props.poster.firstName, props.poster.lastName);
</script>

<template>
  <div
    class="flex cursor-pointer gap-2 border-y border-y-secondary p-4 hover:bg-secondary"
    @click="navigateToPost"
  >
    <Avatar class="cursor-pointer" @click.stop="navigateToPoster">
      <AvatarImage alt="profile-picture" />
      <AvatarFallback>{{ initials }}</AvatarFallback>
    </Avatar>

    <div class="w-full">
      <div class="flex cursor-pointer gap-1" @click.stop="navigateToPoster">
        <span class="cursor-pointer font-bold hover:underline">
          {{ poster.firstName }} {{ poster.lastName }}
        </span>

        <span class="font-normal text-gray-500">@{{ poster.username }} </span>
      </div>

      <p class="w-full">
        {{ post.content ?? "" }}
      </p>

      <QuoteComponent
        v-if="post.quotedPost"
        class="mt-4"
        :post="post.quotedPost"
        :poster="post.quotedPost.user"
      />
    </div>

    <Dialog>
      <DialogTrigger @click.stop>
        <PenLine
          :size="16"
          class="text-green-500 transition-colors hover:text-green-600"
        />
      </DialogTrigger>

      <DialogContent class="top-[15%]">
        <PostTextArea
          placeholder="What is happening?"
          :quoted-post="{ post, poster }"
          @on-submit="onSubmit"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
