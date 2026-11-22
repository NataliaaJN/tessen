<script setup lang="ts">
import { tabsVariants } from '@tessen-ui/core/contracts/tabs';
import { computed } from 'vue';
import { provideTabs } from './tabs.zag.js';

defineOptions({ name: 'TTabs' });

const props = withDefaults(
  defineProps<{
    /** Initial tab when `v-model` is not used. Defaults to the first tab. */
    defaultValue?: string;
    variant?: 'underline' | 'pill' | 'segmented';
    orientation?: 'horizontal' | 'vertical';
    /** `automatic` selects on focus; `manual` waits for Enter or Space. */
    activationMode?: 'automatic' | 'manual';
  }>(),
  {
    defaultValue: undefined,
    variant: undefined,
    orientation: 'horizontal',
    activationMode: 'automatic',
  },
);
const model = defineModel<string>();
defineSlots<{ default?(): unknown }>();

const api = provideTabs({
  value: () => model.value,
  defaultValue: () => props.defaultValue,
  orientation: () => props.orientation,
  activationMode: () => props.activationMode,
  onValueChange: (value) => (model.value = value),
});

const resolved = computed(() =>
  tabsVariants({ variant: props.variant, orientation: props.orientation }),
);
</script>

<template>
  <div :class="resolved.class" v-bind="{ ...api.getRootProps(), ...resolved.attrs }">
    <slot />
  </div>
</template>
