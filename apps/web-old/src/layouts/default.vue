<script setup>
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
</script>

<template>
  <div>
    <slot />
    <VueQueryDevtools />
  </div>
</template>
