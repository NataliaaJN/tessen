<script setup lang="ts">
import { TSelect } from '@tessen-ui/vue';

const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];
</script>

<template>
  <TSelect label="Fruit" :items="items" default-value="cherry" />
</template>
