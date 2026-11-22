<script setup lang="ts">
import { TLink, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="4">
    <TLink href="/components/">Components</TLink>
    <TLink href="https://example.com" external>External</TLink>
  </TStack>
</template>
