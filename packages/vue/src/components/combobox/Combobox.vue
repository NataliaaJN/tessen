<script setup lang="ts">
import { comboboxVariants } from '@tessen-ui/core/contracts/combobox';
import type { SelectItem } from '@tessen-ui/core/contracts/select';
import { computed } from 'vue';
import Portal from '../../internal/Portal.vue';
import { useComboboxRoot } from './combobox.zag.js';

defineOptions({ name: 'TCombobox' });

const props = withDefaults(
  defineProps<{
    items: readonly SelectItem[];
    /** Visible label. It is also the accessible name of the input. */
    label: string;
    /** Initial value when `v-model` is not used. */
    defaultValue?: string;
    placeholder?: string;
    /** Text shown when the typed text matches no option. */
    emptyText?: string;
    disabled?: boolean;
    defaultOpen?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    defaultValue: undefined,
    placeholder: undefined,
    emptyText: 'No results',
    disabled: undefined,
    defaultOpen: undefined,
    size: undefined,
  },
);
/** The chosen value. `null` means nothing; leave it out to let the component keep the state. */
const model = defineModel<string | null | undefined>({ default: undefined });
const open = defineModel<boolean | undefined>('open', { default: undefined });

const { api, collection } = useComboboxRoot({
  items: () => props.items,
  value: () => model.value,
  defaultValue: () => props.defaultValue,
  open: () => open.value,
  defaultOpen: () => props.defaultOpen,
  disabled: () => props.disabled,
  placeholder: () => props.placeholder,
  onValueChange: (value) => (model.value = value),
  onOpenChange: (next) => (open.value = next),
});
const resolved = computed(() => comboboxVariants({ size: props.size }));
</script>

<template>
  <div :class="resolved.class" v-bind="{ ...api.getRootProps(), ...resolved.attrs }">
    <label class="t-combobox__label" v-bind="api.getLabelProps()">{{ label }}</label>
    <div class="t-combobox__control" v-bind="api.getControlProps()">
      <input class="t-combobox__input" v-bind="api.getInputProps()" />
      <button class="t-combobox__trigger" v-bind="api.getTriggerProps()" aria-label="Show options">
        <span class="t-combobox__chevron" aria-hidden="true" />
      </button>
    </div>
    <Portal>
      <div class="t-combobox__positioner" v-bind="api.getPositionerProps()">
        <ul class="t-combobox__content" v-bind="api.getContentProps()">
          <li v-if="collection.items.length === 0" role="presentation" class="t-combobox__empty">
            {{ emptyText }}
          </li>
          <li
            v-for="item in collection.items"
            v-else
            :key="item.value"
            class="t-combobox__item"
            v-bind="api.getItemProps({ item })"
          >
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
            <span class="t-combobox__indicator" v-bind="api.getItemIndicatorProps({ item })" />
          </li>
        </ul>
      </div>
    </Portal>
  </div>
</template>
