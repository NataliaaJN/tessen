<script setup lang="ts">
import { TDialogContent } from '../dialog/index.js';

defineOptions({ name: 'TAlertDialogContent' });

withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'sm' });
defineSlots<{ default?(): unknown }>();
</script>

<template>
  <TDialogContent :size="size"><slot /></TDialogContent>
</template>
