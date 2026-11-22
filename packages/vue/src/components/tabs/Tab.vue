<script setup lang="ts">
import { useTabs } from './tabs.zag.js';

defineOptions({ name: 'TTab' });

const props = defineProps<{
  /** Pairs the tab with the `TTabPanel` of the same value. */
  value: string;
  disabled?: boolean;
}>();
defineSlots<{ default?(): unknown }>();

const { api, registerTab } = useTabs();
if (!props.disabled) registerTab(props.value);
</script>

<template>
  <button type="button" class="t-tabs__tab" v-bind="api.getTriggerProps({ value, disabled })">
    <slot />
  </button>
</template>
