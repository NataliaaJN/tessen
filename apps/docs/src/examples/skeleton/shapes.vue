<script setup lang="ts">
import { TSkeleton, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack gap="2">
    <TSkeleton style="inline-size: 240px; block-size: 16px" />
    <TSkeleton shape="circle" style="inline-size: 40px; block-size: 40px" />
  </TStack>
</template>
