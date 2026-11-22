<script setup lang="ts">
import { provideDropdownMenu } from './dropdown-menu.zag.js';

defineOptions({ name: 'TDropdownMenu' });

const props = withDefaults(
  defineProps<{
    /** Initial state when `v-model:open` is not used. */
    defaultOpen?: boolean;
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  }>(),
  { defaultOpen: false, placement: 'bottom-start' },
);
const open = defineModel<boolean | undefined>('open', { default: undefined });
const emit = defineEmits<{
  /** The `value` of the item the person chose, before the menu closes. */
  select: [value: string];
}>();
defineSlots<{ default?(): unknown }>();

provideDropdownMenu({
  open: () => open.value,
  defaultOpen: () => props.defaultOpen,
  placement: () => props.placement,
  onSelect: (value) => emit('select', value),
  onOpenChange: (next) => (open.value = next),
});
</script>

<template>
  <slot />
</template>
