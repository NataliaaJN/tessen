<script setup lang="ts">
import { TPopover, TPopoverClose, TPopoverContent, TPopoverDescription, TPopoverTitle, TPopoverTrigger } from '@tessen-ui/vue';
</script>

<template>
  <TPopover>
    <TPopoverTrigger>Details</TPopoverTrigger>
    <TPopoverContent>
      <TPopoverTitle>Shipping</TPopoverTitle>
      <TPopoverDescription>Arrives in two days.</TPopoverDescription>
      <TPopoverClose>Close</TPopoverClose>
    </TPopoverContent>
  </TPopover>
</template>
