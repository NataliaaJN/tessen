<script setup lang="ts">
import { usePopover } from './popover.zag.js';

defineOptions({ name: 'TPopoverClose' });
defineSlots<{ default?(): unknown }>();

const { api } = usePopover();
</script>

<template>
  <button type="button" class="t-popover__close" v-bind="api.getCloseTriggerProps()">
    <slot />
  </button>
</template>
