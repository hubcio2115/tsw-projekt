<script setup>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { ArrowLeft } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { effect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";

import PostComponent from "~/components/PostComponent.vue";
import { Button } from "~/components/ui/button";
import { postSchema } from "~/lib/validators/post";
import { userSchema } from "~/lib/validators/user";
import { useAuthStore } from "~/store/authStore";

const store = useAuthStore();
const { user } = storeToRefs(store);

const route = useRoute();
const router = useRouter();

const { data: userProfile } = useQuery({
  queryKey: ["userProfile", route.params.id],
  queryFn: async ({ queryKey: [_, userId] }) => {
    const res = await fetch(`/api/users/${userId}`);

    if (res.ok) {
      const data = res.json();

      return userSchema.parse(data);
    }

    return null;
  },
});

const { data: postData } = useQuery({
  queryKey: ["post", route.params.postId],
  queryFn: async ({ queryKey: [_, postId] }) => {
    const res = await fetch(`/api/posts/${postId}`);

    if (res.ok) {
      const data = res.json();

      return z
        .object({
          post: postSchema,
          replies: z.array(
            z.object({
              reply: postSchema,
              user: userSchema,
            }),
          ),
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

const { data: replies } = useQuery({
  queryKey: ["replies", route.params.postId],
  queryFn: async ({ queryKey: [_, postId] }) => {
    const res = await fetch(`/api/posts/${postId}/replies`);

    if (res.ok) {
      const data = res.json();

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
      const res = await fetch("/api/reply", {
        method: "POST",
        body: JSON.stringify({ userId, content, postId }),
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const data = z
        .object({
          user: userSchema,
          post: postSchema,
        })
        .parse(await res.json());

      return data;
    },

    onSuccess: (data) => {
      if (data) {
        const temp = replies.value;

        temp?.push(data);
        replies.value = temp;
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
  <div class="col-span-2 col-start-2 flex flex-col border-x border-x-secondary">
    <Head>
      <Title
        >{{ userProfile?.firstName }} {{ userProfile?.lastName }} on Y</Title
      >
    </Head>

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

    <PostComponent :post="postData?.post" :poster="userProfile" />

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
