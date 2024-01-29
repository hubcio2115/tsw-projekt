<script setup>
import { DialogTitle } from "radix-vue";

import { cn } from "~/lib/utils";

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
});
</script>

<template>
  <DialogTitle
    v-bind="props"
    :class="
      cn(
        'text-lg font-semibold leading-none tracking-tight text-foreground',
        props.class,
      )
    "
  >
    <slot />
  </DialogTitle>
</template>
