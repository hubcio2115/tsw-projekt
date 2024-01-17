<script setup>
import { useRoute } from "#imports";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { Home, User } from "lucide-vue-next";
import { LogOut, MoreHorizontal } from "lucide-vue-next";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  cn,
  getHandleFromUsername,
  getInitialsFromUsername,
  getNameFromUsername,
  getSurnameNameFromUsername,
} from "~/lib/utils";

const router = useRouter();

const { user, signOut } = useAuth();

const initials = computed(() => getInitialsFromUsername(user.value.name));
const firstName = computed(() => getNameFromUsername(user.value.name));
const lastName = computed(() => getSurnameNameFromUsername(user.value.name));
const handle = computed(() => getHandleFromUsername(user.value.name));
</script>

<template>
  <div>
    <div class="mx-auto grid min-h-screen max-w-5xl grid-cols-4 gap-4">
      <nav class="flex h-full flex-col gap-2 py-4">
        <Button
          variant="ghost"
          class="flex h-12 w-12 rounded-full text-3xl"
          @click="router.push('/')"
        >
          𝕐
        </Button>

        <Button
          variant="ghost"
          :class="
            cn(
              'max-w-min items-start justify-start rounded-full text-2xl',
              useRoute().fullPath === '/' ? 'font-bold' : '',
            )
          "
          @click="router.push('/')"
        >
          <Home :size="24" />
          Home
        </Button>

        <Button
          variant="ghost"
          :class="
            cn(
              'max-w-min items-start justify-start rounded-full text-2xl',
              useRoute().fullPath === '/profile' ? 'font-bold' : '',
            )
          "
          @click="router.push('/profile')"
        >
          <User :size="24" />
          Profile
        </Button>

        <Button
          variant="ghost"
          class="justify-center rounded-full bg-blue-400 p-6 text-lg font-bold text-white hover:bg-blue-500 hover:text-white focus-visible:outline-blue-400"
        >
          Post
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              class="mb-0 mt-auto justify-start rounded-full px-4 py-8"
            >
              <Avatar class="h-10 w-10">
                <AvatarImage
                  :src="user?.image ?? undefined"
                  alt="profile-picture"
                />
                <AvatarFallback>{{ initials }}</AvatarFallback>
              </Avatar>

              <div>
                <p class="font-bold">{{ firstName }} {{ lastName }}</p>
                <p class="text-left">{{ handle }}</p>
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

      <slot />
    </div>
    <VueQueryDevtools />
  </div>
</template>
