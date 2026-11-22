<script setup lang="ts">
import { TStack, TToggleButton } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="3">
    <TToggleButton>Off</TToggleButton>
    <TToggleButton default-pressed>On</TToggleButton>
  </TStack>
</template>
