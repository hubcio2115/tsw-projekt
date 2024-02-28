<script setup>
import { useMutation, useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { ArrowLeft } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { effect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";

import PostComponent from "~/components/PostComponent.vue";
import PostTextArea from "~/components/PostTextArea.vue";
import Spinner from "~/components/ui/Spinner.vue";
import { Button } from "~/components/ui/button";
import { postSchema } from "~/lib/validators/post";
import { userSchema } from "~/lib/validators/user";
import { useAuthStore } from "~/store/authStore";

const store = useAuthStore();
const { user } = storeToRefs(store);

const route = useRoute();
const router = useRouter();

const { data: userProfile, isPending: isUserProfilePending } = useQuery({
  queryKey: ["userProfile", route.params.id],
  queryFn: async ({ queryKey: [_, userId] }) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}`,
      { withCredentials: true },
    );

    if (res.status >= 200 || res.status <= 299) {
      const data = res.data;

      return userSchema.parse(data);
    }

    return null;
  },
});

const { data: postData, isPending: isPostPending } = useQuery({
  queryKey: ["post", route.params.postId],
  queryFn: async ({ queryKey: [_, postId] }) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}`,
      { withCredentials: true },
    );

    if (res.status >= 200 || res.status <= 299) {
      const data = res.data;

      return z
        .object({
          post: postSchema,
          replies: z
            .array(
              z.object({
                reply: postSchema,
                user: userSchema,
              }),
            )
            .nullish(),
        })
        .parse(data);
    }

    return null;
  },
});

effect(() => {
  if (postData.value && postData.value?.replies !== null) {
    postData.value.replies = postData.value?.replies.reverse();
  }
});

const { data: replies, refetch: refetchReplies } = useQuery({
  queryKey: ["replies", route.params.postId],
  queryFn: async ({ queryKey: [_, postId] }) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/replies`,
      { withCredentials: true },
    );

    if (res.status >= 200 || res.status <= 299) {
      const data = res.data;

      return z
        .array(
          z.object({
            post: postSchema,
            user: userSchema,
          }),
        )
        .parse(data);
    }

    return null;
  },
});

const replyMutation =
  /** @type {typeof useMutation<{post: import("~/lib/validators/post").Post, user: import("~/lib/validators/user").User} | null, Error, [string, string, string]>} */ (
    useMutation
  )({
    mutationKey: ["reply", "create"],
    mutationFn: async ([userId, postId, content]) => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts/${postId}/reply`,
        { userId, content, postId },
        { withCredentials: true },
      );

      const isSucessful = res.status >= 200 || res.status <= 299;
      if (!isSucessful) {
        throw new Error(res.statusText);
      }

      const data = z
        .object({
          user: userSchema,
          post: postSchema,
        })
        .parse(res.data);

      return data;
    },

    onSuccess: (data) => {
      if (data) {
        refetchReplies();
      }
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

/**
 * @param {string} content
 */
function onSubmit(content) {
  replyMutation.mutate([user.value?.id, postData.value?.post.id, content]);
}
</script>

<template>
  <div class="flex flex-col border-x border-x-secondary">
    <div class="flex items-center">
      <Button variant="ghost" class="rounded-full px-2" @click="router.back()">
        <ArrowLeft :size="20" />
      </Button>

      <h2 class="text-xl font-bold">Post</h2>
    </div>

    <template v-if="postData?.replies">
      <PostComponent
        v-for="{ reply, user: poster } in postData.replies"
        :key="reply.id"
        :post="reply"
        :poster="poster"
      />
    </template>

    <Spinner v-if="isUserProfilePending || isPostPending" />
    <PostComponent v-else :post="postData?.post" :poster="userProfile" />

    <PostTextArea
      placeholder="Write your reply!"
      class="border-b border-secondary p-4"
      @on-submit="onSubmit"
    />

    <PostComponent
      v-for="reply in replies"
      :key="reply?.post.id"
      :post="reply?.post"
      :poster="reply?.user"
    />
  </div>
</template>
