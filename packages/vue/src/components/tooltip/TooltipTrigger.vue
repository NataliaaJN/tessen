<script setup lang="ts">
import { useTooltip } from './tooltip.zag.js';

defineOptions({ name: 'TTooltipTrigger' });
defineSlots<{ default?(): unknown }>();

const { api } = useTooltip();
</script>

<template>
  <!-- A real button: it must be focusable so keyboard users can open the tooltip. -->
  <button type="button" class="t-tooltip__trigger" v-bind="api.getTriggerProps()">
    <slot />
  </button>
</template>
