<script setup lang="ts">
import { tableVariants } from '@tessen-ui/core/contracts/table';
import { computed } from 'vue';

defineOptions({ name: 'TTable' });

const props = withDefaults(
  defineProps<{
    density?: 'comfortable' | 'compact';
    striped?: boolean;
  }>(),
  { density: undefined },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => tableVariants({ density: props.density, striped: props.striped }));
// A real <table>. Name it with a TTableCaption (or aria-label).
</script>

<template>
  <table :class="resolved.class" v-bind="resolved.attrs">
    <slot />
  </table>
</template>
