<script setup>
import { Circle } from "lucide-vue-next";
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioItem,
  useEmitAsProps,
} from "radix-vue";

import { cn } from "~/lib/utils";

const props = defineProps({
  value: { type: String, required: true },
  disabled: { type: Boolean, required: false },
  textValue: { type: String, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: String, required: false },
});

const emits = defineEmits(["select"]);
</script>

<template>
  <DropdownMenuRadioItem
    v-bind="{ ...props, ...useEmitAsProps(emits) }"
    :class="
      cn(
        'data-[highlighted]:bg-outline-hover relative flex cursor-default select-none items-center rounded-md py-1.5 pl-7 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class,
      )
    "
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuItemIndicator>
        <Circle class="h-2 w-2 fill-current" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>
