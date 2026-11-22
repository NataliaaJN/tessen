<script setup lang="ts">
import { provideTooltip } from './tooltip.zag.js';

defineOptions({ name: 'TTooltip' });

const props = withDefaults(
  defineProps<{
    /** Milliseconds before it opens on hover. Keyboard focus opens it right away. */
    openDelay?: number;
    /** Milliseconds before it closes after the pointer leaves. */
    closeDelay?: number;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    disabled?: boolean;
  }>(),
  { openDelay: 400, closeDelay: 150, placement: 'top' },
);
defineSlots<{ default?(): unknown }>();

provideTooltip({
  openDelay: () => props.openDelay,
  closeDelay: () => props.closeDelay,
  placement: () => props.placement,
  disabled: () => props.disabled,
});
</script>

<template>
  <slot />
</template>
