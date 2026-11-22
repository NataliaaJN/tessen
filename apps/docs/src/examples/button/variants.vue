<script setup lang="ts">
import { TButton } from '@tessen-ui/vue';
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
    <TButton>Primary</TButton>
    <TButton variant="secondary">Secondary</TButton>
    <TButton variant="outline">Outline</TButton>
    <TButton variant="ghost">Ghost</TButton>
    <TButton tone="danger">Danger</TButton>
    <TButton loading>Loading</TButton>
    <TButton disabled>Disabled</TButton>
  </div>
</template>
