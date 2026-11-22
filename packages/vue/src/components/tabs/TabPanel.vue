<script setup lang="ts">
import { useTabs } from './tabs.zag.js';

defineOptions({ name: 'TTabPanel' });

defineProps<{
  /** Pairs the panel with the `TTab` of the same value. */
  value: string;
}>();
defineSlots<{ default?(): unknown }>();

const { api } = useTabs();
</script>

<template>
  <div class="t-tabs__panel" v-bind="api.getContentProps({ value })"><slot /></div>
</template>
