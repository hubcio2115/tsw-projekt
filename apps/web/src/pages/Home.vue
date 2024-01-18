<script setup>
import { Button } from "~/components/ui/button";
import { ref } from "vue";

const counter = ref(0);
</script>

<template>
  <div>
    <Button @click="counter++">Counter: {{ counter }}</Button>
  </div>
</template>
