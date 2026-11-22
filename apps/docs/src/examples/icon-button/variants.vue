<script setup lang="ts">
import { TIconButton, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="3" align="center">
    <TIconButton label="Close">×</TIconButton>
    <TIconButton label="Close" variant="ghost" size="sm">×</TIconButton>
    <TIconButton label="Delete" variant="outline" tone="danger">×</TIconButton>
  </TStack>
</template>
