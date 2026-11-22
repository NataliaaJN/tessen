<script setup lang="ts">
import { switchVariants } from '@tessen-ui/core/contracts/switch';
import { computed, useAttrs } from 'vue';
import { useControlState } from '../../internal/field-context.js';

defineOptions({ name: 'TSwitch', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
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
const resolved = computed(() => switchVariants({ size: props.size, invalid: state.invalid.value }));
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
    :data-state="checked ? 'checked' : 'unchecked'"
  >
    <input
      v-bind="inputAttrs"
      class="t-switch__input"
      type="checkbox"
      role="switch"
      :checked="checked"
      :disabled="state.disabled.value"
      :required="state.required.value"
      :aria-invalid="state.invalid.value || undefined"
      @change="onChange"
    />
    <span class="t-switch__track" aria-hidden="true"><span class="t-switch__thumb" /></span>
    <span v-if="$slots.default" class="t-switch__label"><slot /></span>
  </label>
</template>
