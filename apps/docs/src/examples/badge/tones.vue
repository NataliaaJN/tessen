<script setup lang="ts">
import { TBadge, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="2" wrap>
    <TBadge tone="neutral">neutral</TBadge>
    <TBadge tone="brand">brand</TBadge>
    <TBadge tone="success">success</TBadge>
    <TBadge tone="warning">warning</TBadge>
    <TBadge tone="danger">danger</TBadge>
    <TBadge tone="info">info</TBadge>
    <TBadge variant="solid" tone="brand">solid</TBadge>
    <TBadge variant="outline" tone="success">outline</TBadge>
  </TStack>
</template>
