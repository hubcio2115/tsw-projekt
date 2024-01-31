<script setup>
import { useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { Loader2 } from "lucide-vue-next";
import { z } from "zod";

import PostComponent from "~/components/PostComponent.vue";
import Spinner from "~/components/ui/Spinner.vue";
import { Button } from "~/components/ui/button";
import { env } from "~/env.mjs";
import { postSchema } from "~/lib/validators/post.js";
import { userSchema } from "~/lib/validators/user";

const {
  data: posts,
  isPending,
  refetch,
} = useQuery({
  queryKey: ["home", "posts"],
  queryFn: async () => {
    const res = await axios.get(`${env.VITE_API_BASE_URL}/api/home`, {
      withCredentials: true,
    });

    if (res.status >= 200 || res.status <= 299) {
      const data = await res.data;

      return z
        .array(
          z.object({
            user: userSchema,
            post: postSchema,
          }),
        )
        .parse(data);
    }

    return null;
  },
});
</script>

<template>
  <div
    class="col-span-2 col-start-2 flex flex-col items-center justify-center border-x border-x-secondary"
  >
    <Head>
      <Title>Home / 𝕐</Title>
    </Head>

    <div class="flex h-full w-full flex-col">
      <Spinner v-if="isPending" />

      <div
        v-else-if="!posts"
        class="flex h-full flex-col items-center justify-center"
      >
        <h2 class="text-xl font-bold">Gosh something went wrong!</h2>
        <p>There is probably more info in the console.</p>
        <p>
          But if you don't want to do that try refetching in couple of minutes.
        </p>

        <Button variant="ghost" @click="refetch"><Loader2 /></Button>
      </div>

      <div
        v-else-if="posts.length === 0"
        class="flex h-full flex-col items-center justify-center"
      >
        <h2 class="text-xl font-bold">Wow nothing to see here?</h2>
        <p>Try following someone, every new post will show up here!</p>
      </div>

      <PostComponent
        v-for="{ post, user: poster } in posts"
        v-else
        :key="post?.id"
        :post="post"
        :poster="poster"
      />
    </div>
  </div>
</template>
