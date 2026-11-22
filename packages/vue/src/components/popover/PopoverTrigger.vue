<script setup lang="ts">
import { usePopover } from './popover.zag.js';

defineOptions({ name: 'TPopoverTrigger' });
defineSlots<{ default?(): unknown }>();

const { api } = usePopover();
</script>

<template>
  <button type="button" class="t-popover__trigger" v-bind="api.getTriggerProps()">
    <slot />
  </button>
</template>
