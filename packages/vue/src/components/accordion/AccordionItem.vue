<script setup lang="ts">
import { provideAccordionItem, useAccordion } from './accordion.zag.js';

defineOptions({ name: 'TAccordionItem' });

const props = withDefaults(
  defineProps<{
    /** Identifies the item in the accordion value. */
    value: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);
defineSlots<{ default?(): unknown }>();

const { api } = useAccordion();
provideAccordionItem(
  () => props.value,
  () => props.disabled,
);
</script>

<template>
  <div class="t-accordion__item" v-bind="api.getItemProps({ value, disabled })">
    <slot />
  </div>
</template>
