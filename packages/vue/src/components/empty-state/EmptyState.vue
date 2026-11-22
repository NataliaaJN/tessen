<script setup lang="ts">
import { emptyStateVariants } from '@tessen-ui/core/contracts/empty-state';
import { computed } from 'vue';

defineOptions({ name: 'TEmptyState' });

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    size?: 'md' | 'sm';
  }>(),
  { description: undefined, size: undefined },
);
// `icon`: decorative illustration; the default slot holds the actions (buttons, links).
defineSlots<{ default?(): unknown; icon?(): unknown }>();

const resolved = computed(() => emptyStateVariants({ size: props.size }));
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs">
    <div v-if="$slots.icon" class="t-empty-state__icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <p class="t-empty-state__title">{{ title }}</p>
    <p v-if="description" class="t-empty-state__description">{{ description }}</p>
    <div v-if="$slots.default" class="t-empty-state__actions"><slot /></div>
  </div>
</template>
