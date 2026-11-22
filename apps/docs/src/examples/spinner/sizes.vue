<script setup lang="ts">
import { TSpinner, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="4" align="center">
    <TSpinner size="sm" />
    <TSpinner />
    <TSpinner size="lg" label="Saving" />
  </TStack>
</template>
