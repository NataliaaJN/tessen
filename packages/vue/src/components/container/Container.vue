<script setup lang="ts">
import { containerVariants } from '@tessen-ui/core/contracts/container';
import { computed } from 'vue';

defineOptions({ name: 'TContainer' });

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    gutters?: boolean;
  }>(),
  { size: undefined, gutters: true },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => containerVariants({ size: props.size, gutters: props.gutters }));
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs"><slot /></div>
</template>
