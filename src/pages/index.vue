<script setup>
import { Button } from "~/components/ui/button";

const { signOut, session, user, status, signIn } = useAuth();
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center">
    <h1 class="text-2xl font-bold">Hello from Nuxt!</h1>

    <Button @click="signOut({ callbackUrl: '/' })"> Log out </Button>

    <Button @click="signIn('google')"> Log in </Button>

    <p>
      {{ session?.user?.name }}
    </p>

    <p>
      {{ user?.name }}
    </p>

    <p>
      {{ status }}
    </p>
  </div>
</template>
