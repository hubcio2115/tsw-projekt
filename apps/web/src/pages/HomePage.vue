<script setup>
import { useInfiniteQuery } from "@tanstack/vue-query";
import { useIntersectionObserver } from "@vueuse/core";
import axios from "axios";
import { io } from "socket.io-client";
import { onMounted, onUnmounted, ref } from "vue";
import { z } from "zod";

import PostComponent from "~/components/PostComponent.vue";
import Spinner from "~/components/ui/Spinner.vue";
import { Badge } from "~/components/ui/badge";
import { postSchema } from "~/lib/validators/post.js";
import { userSchema } from "~/lib/validators/user";
import { useAuthStore } from "~/store/authStore";

const store = useAuthStore();

/** @type {ReturnType<typeof $ref<import('socket.io-client').Socket | null>>} */
let postSocket = $ref(null);

let numberOfNewPosts = $ref(0);

onMounted(() => {
  postSocket = io(`${import.meta.env.VITE_API_BASE_URL}/post`);

  postSocket.on("connection", () => {
    console.log("Connected to /post.");
  });

  postSocket.on(
    "posted",
    /** @param {string[]} userIds */ (userIds) => {
      const isUserInFollowers = userIds.some((id) => id === store.user?.id);

      if (isUserInFollowers) {
        numberOfNewPosts += 1;
      }
    },
  );
});

onUnmounted(() => {
  postSocket?.disconnect();
});

let newestPostCreatedAt = $ref(new Date());
let oldestPostCreatedAt = $ref(new Date());

const {
  data,
  fetchNextPage,
  fetchPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
  isPending,
} = useInfiniteQuery({
  queryKey: ["home", "posts"],
  queryFn: async ({ pageParam: [pageParam, earlierThan] }) => {
    const params = new URLSearchParams({
      earlierThan: earlierThan.toString(),
      date: pageParam.toISOString(),
    });

    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/posts/home?${params.toString()}`,
      {
        withCredentials: true,
      },
    );

    if (res.status >= 200 || res.status <= 299) {
      const data = z
        .array(
          z.object({
            user: userSchema,
            post: postSchema,
          }),
        )
        .parse(res.data);

      const firstPostCreatedAt = new Date(data[0]?.post?.createdAt);
      const lastPostCreatedAt = new Date(
        data[data.length - 1]?.post?.createdAt,
      );

      if (firstPostCreatedAt > newestPostCreatedAt) {
        newestPostCreatedAt = firstPostCreatedAt;
      }

      if (lastPostCreatedAt < oldestPostCreatedAt) {
        oldestPostCreatedAt = lastPostCreatedAt;
      }

      if (earlierThan) {
        numberOfNewPosts -= data.length;
      }

      return data;
    }

    return null;
  },
  initialPageParam: [newestPostCreatedAt, false],
  getNextPageParam: (lastPage) => {
    if (lastPage?.length !== 10) return;

    return [oldestPostCreatedAt, false];
  },
  getPreviousPageParam: () => {
    return [newestPostCreatedAt, true];
  },
  staleTime: Infinity,
});

const computedData = $computed(() => {
  return data.value?.pages.flat().filter(Boolean);
});

/** @type {ReturnType<typeof ref<HTMLElement | null>>} */
const intersectionForNextPages = ref(null);
useIntersectionObserver(intersectionForNextPages, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    fetchNextPage();
  }
});

/** @type {ReturnType<typeof ref<HTMLElement | null>>} */
const intersectionForPreviousPages = ref(null);
useIntersectionObserver(
  intersectionForPreviousPages,
  ([{ isIntersecting }]) => {
    if (isIntersecting && numberOfNewPosts > 0) {
      fetchPreviousPage();
    }
  },
);

function handleBadgeClick() {
  numberOfNewPosts = 0;
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center border-x border-x-secondary"
  >
    <div class="flex h-full w-full flex-col">
      <Badge
        v-if="numberOfNewPosts"
        class="absolute left-[calc(50%-80px)] top-2 mx-auto w-40 cursor-pointer fade-in fade-out"
        @click="handleBadgeClick"
      >
        There {{ numberOfNewPosts > 1 ? "are" : "is" }}
        {{ numberOfNewPosts }} new post{{ numberOfNewPosts > 1 ? "s" : "" }}
      </Badge>

      <Spinner v-if="isPending" />

      <div
        v-else-if="!data?.pages"
        class="flex h-full flex-col items-center justify-center"
      >
        <h2 class="text-xl font-bold">Gosh something went wrong!</h2>
        <p>There is probably more info in the console.</p>
        <p>
          But if you don't want to do that try refreshing in couple of minutes.
        </p>
      </div>

      <div
        v-else-if="computedData.length === 0"
        class="flex h-full flex-col items-center justify-center"
      >
        <h2 class="text-xl font-bold">Wow nothing to see here?</h2>
        <p>Try following someone, every new post will show up here!</p>
      </div>

      <template v-else>
        <div ref="intersectionForPreviousPages" />
        <Spinner v-if="isFetchingPreviousPage" />

        <PostComponent
          v-for="{ post, user: poster } in computedData"
          :key="post.id"
          :post="post"
          :poster="poster"
        />

        <Spinner v-if="isFetchingNextPage" />
        <div ref="intersectionForNextPages" />
      </template>
    </div>
  </div>
</template>
