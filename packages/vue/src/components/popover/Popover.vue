<script setup lang="ts">
import { providePopover } from './popover.zag.js';

defineOptions({ name: 'TPopover' });

const props = withDefaults(
  defineProps<{
    /** Initial state when `v-model:open` is not used. */
    defaultOpen?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    closeOnEscape?: boolean;
    closeOnInteractOutside?: boolean;
  }>(),
  { defaultOpen: false, placement: 'bottom', closeOnEscape: true, closeOnInteractOutside: true },
);
const open = defineModel<boolean | undefined>('open', { default: undefined });
defineSlots<{ default?(): unknown }>();

providePopover({
  open: () => open.value,
  defaultOpen: () => props.defaultOpen,
  placement: () => props.placement,
  closeOnEscape: () => props.closeOnEscape,
  closeOnInteractOutside: () => props.closeOnInteractOutside,
  onOpenChange: (next) => (open.value = next),
});
</script>

<template>
  <slot />
</template>
