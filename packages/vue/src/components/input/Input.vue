<script setup lang="ts">
import { inputVariants } from '@tessen-ui/core/contracts/input';
import { computed, useAttrs } from 'vue';
import { useControlState } from '../../internal/field-context.js';

defineOptions({ name: 'TInput', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
    invalid?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    /** Initial value when `v-model` is not used. */
    defaultValue?: string;
    id?: string;
  }>(),
  { size: undefined, type: 'text', defaultValue: undefined, id: undefined },
);
const model = defineModel<string>();
defineSlots<{ leading?(): unknown; trailing?(): unknown }>();

const attrs = useAttrs();
const state = useControlState(props);
const resolved = computed(() => inputVariants({ size: props.size, invalid: state.invalid.value }));
const value = computed(() => model.value ?? props.defaultValue ?? '');
// `class` and `style` style the wrapper; everything else is a native attribute of the control.
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const describedBy = computed(
  () => [attrs['aria-describedby'], state.describedBy.value].filter(Boolean).join(' ') || undefined,
);

function onInput(event: Event) {
  model.value = (event.target as HTMLInputElement).value;
}
</script>

<template>
  <div :class="[resolved.class, attrs.class]" :style="attrs.style as never" v-bind="resolved.attrs">
    <span v-if="$slots.leading" class="t-input__leading"><slot name="leading" /></span>
    <input
      v-bind="controlAttrs"
      :id="state.id.value"
      class="t-input__control"
      :type="type"
      :value="value"
      :disabled="state.disabled.value"
      :readonly="state.readOnly.value"
      :required="state.required.value"
      :aria-invalid="state.invalid.value || undefined"
      :aria-describedby="describedBy"
      @input="onInput"
    />
    <span v-if="$slots.trailing" class="t-input__trailing"><slot name="trailing" /></span>
  </div>
</template>
