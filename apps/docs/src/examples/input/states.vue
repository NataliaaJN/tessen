<script setup lang="ts">
import { TInput, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack gap="3" style="max-inline-size: 20rem">
    <TInput aria-label="Email" type="email" placeholder="you@example.com" />
    <TInput aria-label="Small" size="sm" default-value="Small" />
    <TInput aria-label="Invalid" invalid default-value="Wrong" />
    <TInput aria-label="Disabled" disabled default-value="Disabled" />
  </TStack>
</template>
