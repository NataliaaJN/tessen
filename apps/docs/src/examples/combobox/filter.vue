<script setup lang="ts">
import { TCombobox } from '@tessen-ui/vue';

const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];
</script>

<template>
  <TCombobox label="Search fruit" :items="items" placeholder="Type to filter" />
</template>
