<script setup lang="ts">
import { provideDialog } from '../../internal/dialog.zag.js';

defineOptions({ name: 'TDialog' });

const props = withDefaults(
  defineProps<{
    /** Initial state when `v-model:open` is not used. */
    defaultOpen?: boolean;
    /** `false`: no focus trap and the rest of the page stays reachable. */
    modal?: boolean;
    /** `alertdialog` asks for a decision and is not dismissed by clicking outside. */
    role?: 'dialog' | 'alertdialog';
    closeOnEscape?: boolean;
    closeOnInteractOutside?: boolean;
  }>(),
  {
    defaultOpen: false,
    modal: true,
    role: 'dialog',
    closeOnEscape: true,
    closeOnInteractOutside: undefined,
  },
);
const open = defineModel<boolean | undefined>('open', { default: undefined });
defineSlots<{ default?(): unknown }>();

provideDialog({
  open: () => open.value,
  defaultOpen: () => props.defaultOpen,
  modal: () => props.modal,
  role: () => props.role,
  closeOnEscape: () => props.closeOnEscape,
  closeOnInteractOutside: () => props.closeOnInteractOutside,
  onOpenChange: (next) => (open.value = next),
});
</script>

<template>
  <slot />
</template>
