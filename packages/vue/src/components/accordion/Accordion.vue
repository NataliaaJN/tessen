<script setup lang="ts">
import { accordionVariants } from '@tessen-ui/core/contracts/accordion';
import { computed } from 'vue';
import { provideAccordion } from './accordion.zag.js';

defineOptions({ name: 'TAccordion' });

const props = withDefaults(
  defineProps<{
    /** Initial open items when `v-model` is not used. */
    defaultValue?: string[];
    /** More than one item can be open at once. */
    multiple?: boolean;
    /** The open item can be closed again. With `false` one item always stays open. */
    collapsible?: boolean;
    disabled?: boolean;
    /** Level of the heading around each trigger: pick the one that fits the page outline. */
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    variant?: 'plain' | 'bordered';
  }>(),
  {
    defaultValue: undefined,
    multiple: false,
    collapsible: true,
    disabled: undefined,
    headingLevel: 3,
    variant: undefined,
  },
);
/** Values of the open items. Leave it out to let the component keep the state. */
const model = defineModel<string[] | undefined>({ default: undefined });
defineSlots<{ default?(): unknown }>();

const api = provideAccordion({
  value: () => model.value,
  defaultValue: () => props.defaultValue,
  multiple: () => props.multiple,
  collapsible: () => props.collapsible,
  disabled: () => props.disabled,
  headingLevel: () => props.headingLevel,
  onValueChange: (value) => (model.value = value),
});
const resolved = computed(() => accordionVariants({ variant: props.variant }));
</script>

<template>
  <div :class="resolved.class" v-bind="{ ...api.getRootProps(), ...resolved.attrs }">
    <slot />
  </div>
</template>
