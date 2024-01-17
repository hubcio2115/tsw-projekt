<script setup>
import { ArrowLeft } from "lucide-vue-next";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  getHandleFromUsername,
  getInitialsFromUsername,
  getNameFromUsername,
  getSurnameNameFromUsername,
} from "~/lib/utils";

definePageMeta({
  layout: "main",
  middleware: "auth",
});

const { user } = useAuth();

const firstName = computed(() => getNameFromUsername(user.value.name));
const lastName = computed(() => getSurnameNameFromUsername(user.value.name));
const initials = computed(() => getInitialsFromUsername(user.value.name));
const handle = computed(() => getHandleFromUsername(user.value.name));
</script>

<template>
  <div class="col-span-2 flex flex-col border-x border-x-secondary">
    <div class="flex items-center">
      <Button variant="ghost" class="rounded-full px-2">
        <ArrowLeft :size="20" />
      </Button>

      <h2 class="text-xl font-bold">{{ firstName }} {{ lastName }}</h2>
    </div>

    <div class="h-[200px] bg-secondary" />

    <div class="relative flex h-56 items-center p-4">
      <Avatar
        class="absolute left-2 top-[-64px] h-32 w-32 border-4 border-white"
      >
        <AvatarImage :src="user?.image ?? undefined" alt="profile-picture" />
        <AvatarFallback class="text-2xl">{{ initials }}</AvatarFallback>
      </Avatar>

      <div>
        <p class="text-xl font-bold">{{ firstName }} {{ lastName }}</p>
        <p class="text-gray-500">{{ handle }}</p>
      </div>
    </div>
  </div>
</template>
