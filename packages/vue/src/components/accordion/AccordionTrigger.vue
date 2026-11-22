<script setup lang="ts">
import { useAccordion, useAccordionItem } from './accordion.zag.js';

defineOptions({ name: 'TAccordionTrigger' });
defineSlots<{ default?(): unknown }>();

const { api, headingLevel } = useAccordion();
const item = useAccordionItem();
</script>

<template>
  <component :is="`h${headingLevel}`" class="t-accordion__heading">
    <button
      type="button"
      class="t-accordion__trigger"
      :data-value="item.value"
      v-bind="api.getItemTriggerProps(item)"
    >
      <span class="t-accordion__title"><slot /></span>
      <span
        class="t-accordion__indicator"
        aria-hidden="true"
        v-bind="api.getItemIndicatorProps(item)"
      />
    </button>
  </component>
</template>
