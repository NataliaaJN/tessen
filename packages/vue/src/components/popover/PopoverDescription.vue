<script setup lang="ts">
import { usePopover } from './popover.zag.js';

defineOptions({ name: 'TPopoverDescription' });
defineSlots<{ default?(): unknown }>();

const { api } = usePopover();
</script>

<template>
  <p class="t-popover__description" v-bind="api.getDescriptionProps()"><slot /></p>
</template>
