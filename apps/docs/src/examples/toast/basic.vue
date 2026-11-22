<script setup lang="ts">
import { TButton, TToaster, createToaster } from '@tessen-ui/vue';

const toaster = createToaster();
const notify = () => toaster.create({ title: 'Saved', description: 'Changes stored' });
</script>

<template>
  <div>
    <TButton @click="notify">Notify</TButton>
    <TToaster :toaster="toaster" />
  </div>
</template>
