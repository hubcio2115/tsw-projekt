<script setup>
import { cn } from "~/lib/utils";

import { badgeVariants } from ".";

defineProps({
  variant: { type: null, required: false, default: "default" },
});
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), $attrs.class ?? '')">
    <slot />
  </div>
</template>
