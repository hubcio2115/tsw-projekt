<script setup>
import { useState } from "#imports";

import { Button } from "~/components/ui/button";

const counter = useState(() => 0);
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center">
    <h1 class="text-2xl font-bold">Hello from Nuxt!</h1>

    <Button @click="counter++">Counter: {{ counter }} </Button>
  </div>
</template>
