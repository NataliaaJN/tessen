<script setup lang="ts">
import { TCheckbox, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="4">
    <TCheckbox>Plain</TCheckbox>
    <TCheckbox default-checked>Checked</TCheckbox>
    <TCheckbox indeterminate>Mixed</TCheckbox>
    <TCheckbox disabled>Disabled</TCheckbox>
  </TStack>
</template>
