<script setup lang="ts">
import { TAvatar, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="3" align="center">
    <TAvatar name="Ada Lovelace" size="xs" />
    <TAvatar name="Grace Hopper" />
    <TAvatar name="Alan Turing" shape="square" size="lg" />
    <TAvatar name="Linus" size="xl" />
  </TStack>
</template>
