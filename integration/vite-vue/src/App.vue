<script setup lang="ts">
// Uses only the public entry points. The contract cases and `defineContract` are NOT used here
// on purpose: the build check asserts they are tree-shaken out of the bundle.
import { CheckIcon } from '@tessen-ui/icons/vue';
import { TButton } from '@tessen-ui/vue';
</script>

<template>
  <TButton tone="danger" block>
    <template #leading><CheckIcon :size="16" /></template>
    Save
  </TButton>
</template>
