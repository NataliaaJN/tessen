<script setup lang="ts">
import { TAspectRatio, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="4">
    <div style="inline-size: 160px"><TAspectRatio ratio="16/9"><div class="fill">16/9</div></TAspectRatio></div>
    <div style="inline-size: 160px"><TAspectRatio ratio="1/1"><div class="fill">1/1</div></TAspectRatio></div>
  </TStack>
</template>

<style scoped>
.fill { display: grid; place-items: center; block-size: 100%; background: var(--tessen-color-surface-subtle, #eef); }
</style>
