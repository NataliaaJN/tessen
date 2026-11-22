<script setup lang="ts">
import { badgeVariants } from '@tessen-ui/core/contracts/badge';
import { computed } from 'vue';

defineOptions({ name: 'TBadge' });

const props = withDefaults(
  defineProps<{
    variant?: 'subtle' | 'solid' | 'outline';
    tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
  }>(),
  { variant: undefined, tone: undefined, size: undefined },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() =>
  badgeVariants({ variant: props.variant, tone: props.tone, size: props.size }),
);
</script>

<template>
  <span :class="resolved.class" v-bind="resolved.attrs"><slot /></span>
</template>
