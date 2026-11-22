<script setup lang="ts">
import { gridVariants } from '@tessen-ui/core/contracts/grid';
import { computed } from 'vue';

defineOptions({ name: 'TGrid' });

const props = withDefaults(
  defineProps<{
    columns?: '1' | '2' | '3' | '4' | '6' | '12' | 'auto';
    gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
  }>(),
  { columns: undefined, gap: undefined },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => gridVariants({ columns: props.columns, gap: props.gap }));
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs"><slot /></div>
</template>
