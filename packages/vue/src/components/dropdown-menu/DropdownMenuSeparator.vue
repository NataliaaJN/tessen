<script setup lang="ts">
import { useDropdownMenu } from './dropdown-menu.zag.js';

defineOptions({ name: 'TDropdownMenuSeparator' });

const { api } = useDropdownMenu();
</script>

<template>
  <div class="t-menu__separator" v-bind="api.getSeparatorProps()" />
</template>
