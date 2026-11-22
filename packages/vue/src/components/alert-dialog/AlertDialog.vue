<script setup lang="ts">
import { provideDialog } from '../../internal/dialog.zag.js';

defineOptions({ name: 'TAlertDialog' });

const props = withDefaults(
  defineProps<{
    /** Initial state when `v-model:open` is not used. */
    defaultOpen?: boolean;
    closeOnEscape?: boolean;
  }>(),
  { defaultOpen: false, closeOnEscape: true },
);
const open = defineModel<boolean | undefined>('open', { default: undefined });
defineSlots<{ default?(): unknown }>();

// A modal that interrupts to ask for a decision: a `Dialog` with role alertdialog that a click
// outside does not dismiss. It shares the dialog parts and styles.
provideDialog({
  open: () => open.value,
  defaultOpen: () => props.defaultOpen,
  modal: () => true,
  role: () => 'alertdialog',
  closeOnEscape: () => props.closeOnEscape,
  closeOnInteractOutside: () => false,
  onOpenChange: (next) => (open.value = next),
});
</script>

<template>
  <slot />
</template>
