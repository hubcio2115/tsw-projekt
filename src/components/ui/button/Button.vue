<script setup>
import { cva } from "class-variance-authority";
import { Primitive } from "radix-vue";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * @typedef {import("class-variance-authority").VariantProps<buttonVariants>} ButtonVariantProps
 * @typedef {{as: "button"; asChild: boolean; variant: ButtonVariantProps["variant"]; size: ButtonVariantProps["size"]}} ButtonProps
 * @type ButtonProps
 */
defineProps({
  variant: {
    type: String,
    required: false,
    default: "default",
    /** @param {string} value */
    validator: (value) => {
      return [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ].includes(value);
    },
  },
  size: {
    type: String,
    required: false,
    default: "default",
    /** @param {string} value */
    validator: (value) => {
      return ["default", "sm", "lg", "icon"].includes(value);
    },
  },
  as: { type: String, required: false, default: "button" },
  asChild: { type: Boolean, required: false },
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({ variant, size }),
        /** @type {string} */ ($attrs.class) ?? '',
      )
    "
  >
    <slot />
  </Primitive>
</template>
