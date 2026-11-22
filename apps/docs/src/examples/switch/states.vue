<script setup lang="ts">
import { TSwitch, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="4">
    <TSwitch>Off</TSwitch>
    <TSwitch default-checked>On</TSwitch>
    <TSwitch disabled>Disabled</TSwitch>
  </TStack>
</template>
