<script setup lang="ts">
import { nativeSelectVariants } from '@tessen-ui/core/contracts/native-select';
import { computed, useAttrs } from 'vue';
import { useControlState } from '../../internal/field-context.js';

defineOptions({ name: 'TNativeSelect', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    invalid?: boolean;
    disabled?: boolean;
    /** Initial value when `v-model` is not used. */
    defaultValue?: string;
    id?: string;
  }>(),
  { size: undefined, defaultValue: undefined, id: undefined },
);
const model = defineModel<string>();
defineSlots<{ default?(): unknown }>();

const attrs = useAttrs();
const state = useControlState(props);
const resolved = computed(() =>
  nativeSelectVariants({ size: props.size, invalid: state.invalid.value }),
);
// Only bound when there is a value: otherwise the browser keeps the first option selected.
const valueAttrs = computed(() => {
  const value = model.value ?? props.defaultValue;
  return value === undefined ? {} : { value };
});
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const describedBy = computed(
  () => [attrs['aria-describedby'], state.describedBy.value].filter(Boolean).join(' ') || undefined,
);

function onChange(event: Event) {
  model.value = (event.target as HTMLSelectElement).value;
}
</script>

<template>
  <div :class="[resolved.class, attrs.class]" :style="attrs.style as never" v-bind="resolved.attrs">
    <select
      v-bind="{ ...controlAttrs, ...valueAttrs }"
      :id="state.id.value"
      class="t-native-select__control"
      :disabled="state.disabled.value"
      :required="state.required.value"
      :aria-invalid="state.invalid.value || undefined"
      :aria-describedby="describedBy"
      @change="onChange"
    >
      <slot />
    </select>
  </div>
</template>
