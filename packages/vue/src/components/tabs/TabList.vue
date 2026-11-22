<script setup lang="ts">
import { useTabs } from './tabs.zag.js';

defineOptions({ name: 'TTabList' });
defineSlots<{ default?(): unknown }>();

const { api } = useTabs();
</script>

<template>
  <div class="t-tabs__list" v-bind="api.getListProps()"><slot /></div>
</template>
