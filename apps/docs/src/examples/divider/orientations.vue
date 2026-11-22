<script setup lang="ts">
import { TDivider, TStack } from '@tessen-ui/vue';
</script>

<template>
  <div>
    <p>Above</p>
    <TDivider />
    <TStack direction="horizontal" gap="3" align="center">
      <span>One</span>
      <TDivider orientation="vertical" style="block-size: 24px" />
      <span>Two</span>
    </TStack>
  </div>
</template>
