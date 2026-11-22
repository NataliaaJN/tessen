<script setup lang="ts">
import { useDropdownMenu } from './dropdown-menu.zag.js';

defineOptions({ name: 'TDropdownMenuTrigger' });
defineSlots<{ default?(): unknown }>();

const { api } = useDropdownMenu();
</script>

<template>
  <button type="button" class="t-menu__trigger" v-bind="api.getTriggerProps()">
    <slot />
  </button>
</template>
