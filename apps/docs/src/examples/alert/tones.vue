<script setup lang="ts">
import { TAlert, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack gap="2">
    <TAlert tone="info" title="Heads up">Something you should know.</TAlert>
    <TAlert tone="success" title="Saved">Your changes are live.</TAlert>
    <TAlert tone="warning" title="Careful">This affects other people.</TAlert>
    <TAlert tone="danger" title="Failed">We could not save.</TAlert>
  </TStack>
</template>
