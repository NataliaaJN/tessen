<script setup lang="ts">
import { useDropdownMenu } from './dropdown-menu.zag.js';

defineOptions({ name: 'TDropdownMenuItem' });

defineProps<{
  /** Identifies the item in the root `select` event. */
  value: string;
  disabled?: boolean;
}>();
defineSlots<{ default?(): unknown }>();

const { api } = useDropdownMenu();
</script>

<template>
  <div class="t-menu__item" v-bind="api.getItemProps({ value, disabled })"><slot /></div>
</template>
