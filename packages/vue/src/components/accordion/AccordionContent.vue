<script setup lang="ts">
import { useAccordion, useAccordionItem } from './accordion.zag.js';

defineOptions({ name: 'TAccordionContent' });
defineSlots<{ default?(): unknown }>();

const { api } = useAccordion();
const item = useAccordionItem();
</script>

<template>
  <div class="t-accordion__content" v-bind="api.getItemContentProps(item)"><slot /></div>
</template>
