<script setup lang="ts">
import { TButton, TEmptyState } from '@tessen-ui/vue';
</script>

<template>
  <TEmptyState title="No projects" description="Create one to start.">
    <template #icon>★</template>
    <TButton>Create</TButton>
  </TEmptyState>
</template>
