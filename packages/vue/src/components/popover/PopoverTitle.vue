<script setup lang="ts">
import { usePopover } from './popover.zag.js';

defineOptions({ name: 'TPopoverTitle' });
defineSlots<{ default?(): unknown }>();

const { api } = usePopover();
</script>

<template>
  <h2 class="t-popover__title" v-bind="api.getTitleProps()"><slot /></h2>
</template>
