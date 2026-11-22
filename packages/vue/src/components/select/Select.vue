<script setup lang="ts">
import { selectVariants, type SelectItem } from '@tessen-ui/core/contracts/select';
import { computed } from 'vue';
import Portal from '../../internal/Portal.vue';
import { useSelectRoot } from './select.zag.js';

defineOptions({ name: 'TSelect' });

const props = withDefaults(
  defineProps<{
    items: readonly SelectItem[];
    /** Visible label. It is also the accessible name of the control. */
    label: string;
    /** Initial value when `v-model` is not used. */
    defaultValue?: string;
    placeholder?: string;
    /** Adds a hidden native `<select>` with this name so the value reaches a `<form>`. */
    name?: string;
    disabled?: boolean;
    defaultOpen?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    defaultValue: undefined,
    placeholder: 'Select an option',
    name: undefined,
    disabled: undefined,
    defaultOpen: undefined,
    size: undefined,
  },
);
/** The chosen value. `null` means nothing; leave it out to let the component keep the state. */
const model = defineModel<string | null | undefined>({ default: undefined });
const open = defineModel<boolean | undefined>('open', { default: undefined });

const { api, collection } = useSelectRoot({
  items: () => props.items,
  value: () => model.value,
  defaultValue: () => props.defaultValue,
  open: () => open.value,
  defaultOpen: () => props.defaultOpen,
  disabled: () => props.disabled,
  name: () => props.name,
  onValueChange: (value) => (model.value = value),
  onOpenChange: (next) => (open.value = next),
});
const resolved = computed(() => selectVariants({ size: props.size }));
</script>

<template>
  <div :class="resolved.class" v-bind="{ ...api.getRootProps(), ...resolved.attrs }">
    <label class="t-select__label" v-bind="api.getLabelProps()">{{ label }}</label>
    <div class="t-select__control" v-bind="api.getControlProps()">
      <button class="t-select__trigger" v-bind="api.getTriggerProps()">
        <span class="t-select__value" :data-placeholder="api.valueAsString ? undefined : ''">{{
          api.valueAsString || placeholder
        }}</span>
        <span class="t-select__chevron" aria-hidden="true" />
      </button>
    </div>
    <select v-bind="api.getHiddenSelectProps()">
      <option v-for="item in collection.items" :key="item.value" :value="item.value">
        {{ item.label }}
      </option>
    </select>
    <Portal>
      <div class="t-select__positioner" v-bind="api.getPositionerProps()">
        <ul class="t-select__content" v-bind="api.getContentProps()">
          <li
            v-for="item in collection.items"
            :key="item.value"
            class="t-select__item"
            v-bind="api.getItemProps({ item })"
          >
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            <span class="t-select__indicator" v-bind="api.getItemIndicatorProps({ item })" />
          </li>
        </ul>
      </div>
    </Portal>
  </div>
</template>
