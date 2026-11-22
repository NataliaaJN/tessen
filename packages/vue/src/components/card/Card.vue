<script setup lang="ts">
import { cardVariants } from '@tessen-ui/core/contracts/card';
import { computed } from 'vue';

defineOptions({ name: 'TCard' });

const props = withDefaults(
  defineProps<{
    variant?: 'outlined' | 'elevated' | 'filled';
    padding?: 'none' | 'sm' | 'md' | 'lg';
  }>(),
  { variant: undefined, padding: undefined },
);
defineSlots<{ default?(): unknown; header?(): unknown; footer?(): unknown }>();

const resolved = computed(() => cardVariants({ variant: props.variant, padding: props.padding }));
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs">
    <div v-if="$slots.header" class="t-card__header"><slot name="header" /></div>
    <div class="t-card__body"><slot /></div>
    <div v-if="$slots.footer" class="t-card__footer"><slot name="footer" /></div>
  </div>
</template>
