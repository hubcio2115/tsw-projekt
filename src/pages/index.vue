<script setup>
import { Button } from "~/components/ui/button";

definePageMeta({
  layout: "main",
  middleware: "auth",
});

const router = useRouter();
const { signOut, session, user, status } = useAuth();
</script>

<template>
  <div class="col-span-3 flex flex-col items-center justify-center">
    <Head>
      <Title>Home / 𝕐</Title>
    </Head>

    <h1 class="text-2xl font-bold">Hello from Nuxt!</h1>

    <Button @click="signOut({ callbackUrl: '/auth' })"> Log out </Button>

    <Button @click="router.push('/auth')"> Log in </Button>

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
