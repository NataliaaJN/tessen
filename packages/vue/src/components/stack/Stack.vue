<script setup lang="ts">
import { stackVariants } from '@tessen-ui/core/contracts/stack';
import { computed } from 'vue';

defineOptions({ name: 'TStack' });

const props = withDefaults(
  defineProps<{
    direction?: 'vertical' | 'horizontal';
    gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
    align?: 'stretch' | 'start' | 'center' | 'end';
    justify?: 'start' | 'center' | 'end' | 'between';
    wrap?: boolean;
  }>(),
  { direction: undefined, gap: undefined, align: undefined, justify: undefined, wrap: undefined },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() =>
  stackVariants({
    direction: props.direction,
    gap: props.gap,
    align: props.align,
    justify: props.justify,
    wrap: props.wrap,
  }),
);
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs"><slot /></div>
</template>
