<script setup>
import { useMutation, useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { Home, SquarePen, User } from "lucide-vue-next";
import { LogOut, MoreHorizontal, Settings } from "lucide-vue-next";
import io from "socket.io-client";
import { onMounted, onUnmounted } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { z } from "zod";

import PostTextArea from "~/components/PostTextArea.vue";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn, getInitials } from "~/lib/utils";
import { postSchema } from "~/lib/validators/post";
import { userSchema } from "~/lib/validators/user";
import { useAuthStore } from "~/store/authStore";

const router = useRouter();
const route = useRoute();

const store = useAuthStore();

/** @type {ReturnType<typeof $ref<import('socket.io-client').Socket | null>>} */
let followSocket = $ref(null);

/** @type {ReturnType<typeof $ref<import('socket.io-client').Socket | null>>} */
let postSocket = $ref(null);

onMounted(() => {
  followSocket = io(`${import.meta.env.VITE_API_BASE_URL}/follow`);

  followSocket.on("connection", () => {
    console.log("Connected to /follow.");
  });

  /** @param {{ sender: string; target: string; senderUsername: string}} followEvent */
  followSocket.on("followed", (followEvent) => {
    if (followEvent.target === store.user?.id) {
      alert(`${followEvent.senderUsername} followed you!`);
    }
  });

  postSocket = io(`${import.meta.env.VITE_API_BASE_URL}/post`);

  postSocket.on("connection", () => {
    console.log("Connected to /post.");
  });
});

onUnmounted(() => {
  followSocket?.disconnect();
  postSocket?.disconnect();
});

const { data: users, isPending: fetchingUsers } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/users`,
      {
        withCredentials: true,
      },
    );

    if (res.status >= 200 || res.status <= 299) {
      const users = z.array(userSchema).parse(res.data);

      return users;
    }

    return [];
  },
});

async function signOut() {
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`,
    {
      withCredentials: true,
    },
  );

  if (res.status >= 200 || res.status <= 299) {
    store.unsetUser();
    await router.push("/auth");
  }
}

const postMutation =
  /** @type {typeof useMutation<import("~/lib/validators/post").Post | null, Error, string>} */ (
    useMutation
  )({
    mutationKey: ["post", "create"],
    mutationFn: async (content) => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/posts`,
        { content },
        { withCredentials: true },
      );

      const isSucessful = res.status >= 200 || res.status <= 299;
      if (!isSucessful) {
        throw new Error(res.statusText);
      }

      const data = postSchema.parse(await res.data);

      return data;
    },

    onSuccess: (data) => {
      postSocket?.emit("post", store.user?.id);
      router.push(`/${store.user?.id}/posts/${data?.id}`);
    },
  });

/**
 * @param {string} content
 */
function onSubmit(content) {
  postMutation.mutate(content);
}

const initials = $computed(() =>
  getInitials(store.user?.firstName, store.user?.lastName),
);

/**
 * @param {string} userId
 */
function goToUserProfile(userId) {
  router.push(`/${userId}`);
}
</script>

<template>
  <div class="mx-auto grid min-h-screen max-w-5xl md:grid-cols-4 md:gap-4">
    <nav
      class="fixed bottom-0 flex w-full items-center justify-center gap-2 bg-white py-4 md:h-full md:w-auto md:flex-col md:items-start"
    >
      <Button
        variant="ghost"
        class="hidden h-12 w-12 rounded-full text-3xl md:flex"
        @click="router.push('/home')"
      >
        𝕐
      </Button>

      <Button
        variant="ghost"
        :class="
          cn(
            'max-w-min items-start justify-start rounded-full text-2xl',
            route.fullPath === '/home' ? 'font-bold' : '',
          )
        "
        @click="router.push('/')"
      >
        <Home :size="24" />
        <span class="hidden md:inline">Home</span>
      </Button>

      <Button
        variant="ghost"
        :class="
          cn(
            'max-w-min items-start justify-start rounded-full text-2xl',
            route.fullPath === `/${store.user?.id}` ? 'font-bold' : '',
          )
        "
        @click="goToUserProfile(store.user?.id)"
      >
        <User :size="24" />
        <span class="hidden md:inline">Profile</span>
      </Button>

      <Button
        variant="ghost"
        :class="
          cn(
            'max-w-min items-start justify-start rounded-full text-2xl',
            route.fullPath === '/details' ? 'font-bold' : '',
          )
        "
        @click="router.push('/details')"
      >
        <Settings :size="24" />
        <span class="hidden md:inline">Settings</span>
      </Button>

      <Dialog>
        <DialogTrigger
          class="w-min justify-center rounded-full bg-blue-400 px-3 py-2 text-lg font-bold text-white hover:bg-blue-500 hover:text-white focus-visible:outline-blue-400 md:w-full lg:p-3"
        >
          <span class="hidden md:inline-block">Post</span>
          <SquarePen class="inline md:hidden" :size="24" />
        </DialogTrigger>

        <DialogContent class="top-[150px]">
          <PostTextArea
            placeholder="What is happening?"
            @on-submit="onSubmit"
          />
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            class="mb-0 mt-auto hidden justify-start rounded-full px-2 py-8 md:flex lg:px-4"
          >
            <Avatar class="h-10 w-10">
              <AvatarImage alt="profile-picture" />
              <AvatarFallback>{{ initials }}</AvatarFallback>
            </Avatar>

            <div>
              <p class="font-bold">
                {{ store.user?.firstName }} {{ store.user?.lastName }}
              </p>
              <p class="text-left">@{{ store.user?.username }}</p>
            </div>

            <MoreHorizontal class="ml-auto mr-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent class="w-56 rounded-xl">
          <DropdownMenuItem
            class="cursor-pointer rounded-xl text-red-500 hover:text-red-600 focus:text-red-600"
            @click="signOut()"
          >
            Log out
            <LogOut class="ml-auto mr-0" :size="16" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>

    <RouterView
      :key="route.fullPath"
      class="col-span-2 mb-[76px] md:col-start-2 md:mb-0"
    />

    <ul
      class="items-left hidden flex-col pt-4 md:sticky md:top-0 md:col-start-4 md:flex md:h-screen"
    >
      <Spinner v-if="fetchingUsers" />

      <template v-else-if="users">
        <li v-for="userProfile in users" :key="userProfile?.id">
          <span
            class="cursor-pointer hover:underline"
            @click="goToUserProfile(userProfile?.id)"
            >@{{ userProfile?.username }}</span
          >
        </li>
      </template>
    </ul>
  </div>
</template>
