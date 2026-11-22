<script setup lang="ts">
import { TButton, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack gap="4">
    <TStack direction="horizontal" gap="2"><TButton>One</TButton><TButton variant="outline">Two</TButton></TStack>
    <TStack gap="2"><TButton variant="secondary">Three</TButton><TButton variant="ghost">Four</TButton></TStack>
  </TStack>
</template>
