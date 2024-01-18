<script setup>
import { Button } from "~/components/ui/button";

const { signIn } = useAuth();
</script>

<template>
  <div class="flex min-h-screen items-center justify-center gap-96">
    <Head>
      <Title>Y. It's what's happening / Y</Title>
    </Head>

    <h1 class="text-[420px] font-bold">𝕐</h1>

    <div>
      <h2 class="mb-6 text-6xl font-bold">Happening now</h2>

      <div class="flex flex-col gap-4">
        <h3 class="text-3xl font-bold">Join today.</h3>

        <Button
          variant="outline"
          class="max-w-[300px] rounded-full text-base"
          @click="signIn('google', { callbackUrl: '/' })"
        >
          <NuxtImg
            src="google-logo.svg"
            width="18px"
            height="18px"
            alt="google-logo"
          />

          Sign up with Google
        </Button>
      </div>
    </div>
  </div>
</template>
