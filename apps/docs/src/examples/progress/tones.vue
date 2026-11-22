<script setup lang="ts">
import { TProgress, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack gap="4" style="max-inline-size: 24rem">
    <TProgress aria-label="Upload" :value="40" />
    <TProgress aria-label="Busy" tone="success" size="lg" />
    <TProgress aria-label="Almost full" tone="danger" size="sm" :value="90" />
  </TStack>
</template>
