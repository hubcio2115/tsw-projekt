<script setup>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { ArrowLeft } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import io from "socket.io-client";
import { onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";

import Spinner from "~/components/ui/Spinner.vue";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { env } from "~/env.mjs";
import { cn, getInitials } from "~/lib/utils";
import { postSchema } from "~/lib/validators/post";
import { userSchema } from "~/lib/validators/user";
import { useAuthStore } from "~/store/authStore";

const router = useRouter();
const route = useRoute();

const store = useAuthStore();
const { user } = storeToRefs(store);

const { data: userProfile } = useQuery({
  queryKey: ["user", route.params.id],
  queryFn: async ({ queryKey: [_, userId] }) => {
    const res = await fetch(`/api/users/${userId}`);

    if (res.ok) {
      const data = await res.json();

      return userSchema.parse(data);
    }

    return null;
  },
});

let isEdditingBio = $ref(false);

let userBio = $computed({
  get: () => userProfile.value?.bio ?? "",
  set: (val) => val,
});

/** @type {ReturnType<typeof $ref<import('socket.io-client').Socket | null>>} */
let socket = $ref(null);

onMounted(() => {
  socket = io(env.VITE_API_BASE_URL);
});

onUnmounted(() => {
  socket?.disconnect();
});

function toggleIsEdditing() {
  isEdditingBio = !isEdditingBio;
  userBio = userProfile.value?.bio ?? "";
}

const { mutate: updateBio, isPending: isUpdateBioPending } =
  /** @type {typeof useMutation<import("~/lib/validators/user").User, Error, string>} */ (
    useMutation
  )({
    mutationKey: ["bio"],
    mutationFn: async (bio) => {
      const res = await fetch(`/api/users/${userProfile.value?.id}/bio`, {
        method: "PUT",
        body: JSON.stringify({ bio }),
      });

      if (res.ok) {
        const data = userSchema.parse(await res.json());

        return data;
      }

      throw new Error(res.statusText);
    },

    onSuccess: (data) => {
      userBio = data.bio ?? "";
      userProfile.value = data;
      toggleIsEdditing();
    },
  });

function submitBio() {
  updateBio(userBio);
}

let isFollowing = $ref(false);

onMounted(() => {
  fetch(`/api/users/${route.params.id}/isFollowing`)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const { isFollowing: newFollowStatus } = z
        .object({ isFollowing: z.boolean() })
        .parse(data);

      isFollowing = newFollowStatus;
    });
});

const { mutate: followUser, isPending: isFollowPending } =
  /** @type {typeof useMutation<{success: boolean} | null, Error, string>} */ (
    useMutation
  )({
    mutationKey: ["follow", user.value?.id, userProfile.value?.id],
    mutationFn: async () => {
      const res = await fetch(`/api/users/${userProfile.value?.id}/follow`, {
        method: "POST",
      });

      if (res.ok) {
        return null;
      }

      throw res.statusText;
    },

    onSuccess: () => {
      isFollowing = !isFollowing;

      if (isFollowing) {
        socket?.emit("follow", {
          sender: user.value?.id,
          senderUsername: userProfile.value?.username,
          target: userProfile.value?.id,
        });
      }
    },
  });

const { data: posts } = useQuery({
  queryKey: ["posts", route.params.id],
  queryFn: async () => {
    const res = await fetch(`/api/users/${route.params.id}/posts`);

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    const data = await res.json();

    const posts = z
      .array(
        z.object({
          user: userSchema,
          post: postSchema,
        }),
      )
      .safeParse(data);

    if (!posts.success) {
      console.error(posts.error);
      throw posts.error;
    }

    return posts.data;
  },
});

const initials = $computed(() =>
  getInitials(userProfile.value?.firstName, userProfile.value?.lastName),
);
</script>

<template>
  <div class="col-span-2 col-start-2 flex flex-col border-x border-x-secondary">
    <Head>
      <Title>
        {{ userProfile?.firstName }} {{ userProfile?.lastName }} @{{
          userProfile?.username
        }}
      </Title>
    </Head>

    <div class="flex items-center">
      <Button variant="ghost" class="rounded-full px-2" @click="router.back()">
        <ArrowLeft :size="20" />
      </Button>

      <h2 class="text-xl font-bold">
        {{ userProfile?.firstName }} {{ userProfile?.lastName }}
      </h2>
    </div>

    <div class="h-[200px] bg-secondary" />

    <div
      :class="
        cn('relative flex h-72 items-center p-4', isEdditingBio ? 'h-80' : '')
      "
    >
      <Avatar
        class="absolute left-2 top-[-64px] h-32 w-32 border-4 border-white"
      >
        <AvatarImage alt="profile-picture" />
        <AvatarFallback class="text-2xl">{{ initials }}</AvatarFallback>
      </Avatar>

      <div class="w-full">
        <p class="text-xl font-bold">
          {{ userProfile?.firstName }} {{ userProfile?.lastName }}
        </p>
        <p class="text-gray-500">@{{ userProfile?.username }}</p>

        <div class="flex flex-col items-end gap-2">
          <p
            v-if="!isEdditingBio || user?.id !== userProfile?.id"
            class="w-full"
          >
            {{ userProfile?.bio }}
          </p>

          <template v-if="user?.id === userProfile?.id">
            <Textarea
              v-if="isEdditingBio"
              v-model="userBio"
              placeholder="Write something about yourself, it can be anything..."
            />

            <div class="flex w-full justify-between">
              <Button
                v-if="isEdditingBio"
                size="sm"
                class="max-w-min rounded-full"
                :disabled="userBio.length === 0 || userBio === userProfile?.bio"
                :spinner="isUpdateBioPending"
                @click="submitBio"
              >
                Submit
              </Button>

              <div v-else />

              <Button
                size="sm"
                class="rounded-full"
                :variant="isEdditingBio ? 'outline' : 'default'"
                @click="toggleIsEdditing"
                >{{ isEdditingBio ? "Stop" : "Edit Bio" }}</Button
              >
            </div>
          </template>
        </div>
      </div>

      <template v-if="userProfile?.id !== user?.id">
        <Button
          v-if="!isFollowing"
          class="absolute right-5 top-5 rounded-full border-none font-bold after:content-['Follow']"
          :spinner="isFollowPending"
          :disabled="isFollowPending"
          @click="followUser"
        />

        <Button
          v-else
          class="absolute right-5 top-5 rounded-full border-none font-bold after:content-['Following'] hover:border-red-500 hover:bg-red-100 hover:text-red-500 hover:after:content-['Unfollow']"
          variant="outline"
          :spinner="isFollowPending"
          :disabled="isFollowPending"
          @click="followUser"
        />
      </template>
    </div>

    <div>
      <ClientOnly>
        <template #fallback>
          <Spinner class="mx-auto" />
        </template>

        <p v-if="posts && posts?.length === 0" class="text-center">
          No posts, yet... <br />
          Maybe it's time to <span class="font-bold"> post </span> something?
        </p>

        <template v-else>
          <div v-for="{ post, user: poster } in posts" :key="post.id">
            <PostComponent :post="post" :poster="poster" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
