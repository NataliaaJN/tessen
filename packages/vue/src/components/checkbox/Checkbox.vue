<script setup lang="ts">
import { checkboxVariants } from '@tessen-ui/core/contracts/checkbox';
import { computed, useAttrs } from 'vue';
import { useControlState } from '../../internal/field-context.js';

defineOptions({ name: 'TCheckbox', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    /** Mixed state: shown and exposed to assistive technology until the user toggles it. */
    indeterminate?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    /** Initial state when `v-model` is not used. */
    defaultChecked?: boolean;
  }>(),
  { size: undefined, defaultChecked: undefined },
);
const model = defineModel<boolean | undefined>({ default: undefined });
defineSlots<{ default?(): unknown }>();

const attrs = useAttrs();
const state = useControlState(props);
const checked = computed(() => model.value ?? props.defaultChecked ?? false);
const resolved = computed(() =>
  checkboxVariants({ size: props.size, invalid: state.invalid.value }),
);
const dataState = computed(() =>
  props.indeterminate ? 'indeterminate' : checked.value ? 'checked' : 'unchecked',
);
// `class` and `style` style the wrapping label; everything else is a native attribute of the input.
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

function onChange(event: Event) {
  model.value = (event.target as HTMLInputElement).checked;
}
</script>

<template>
  <label
    :class="[resolved.class, attrs.class]"
    :style="attrs.style as never"
    v-bind="resolved.attrs"
    :data-state="dataState"
  >
    <input
      v-bind="inputAttrs"
      class="t-checkbox__input"
      type="checkbox"
      :checked="checked"
      :indeterminate="indeterminate"
      :disabled="state.disabled.value"
      :required="state.required.value"
      :aria-invalid="state.invalid.value || undefined"
      @change="onChange"
    />
    <span class="t-checkbox__box" aria-hidden="true">
      <svg viewBox="0 0 16 16" class="t-checkbox__mark t-checkbox__mark--check">
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
      <svg viewBox="0 0 16 16" class="t-checkbox__mark t-checkbox__mark--minus">
        <path d="M4 8h8" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
    </span>
    <span v-if="$slots.default" class="t-checkbox__label"><slot /></span>
  </label>
</template>
