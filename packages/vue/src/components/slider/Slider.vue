<script setup lang="ts">
import { sliderVariants } from '@tessen-ui/core/contracts/slider';
import { computed } from 'vue';
import { useSliderRoot } from './slider.zag.js';

defineOptions({ name: 'TSlider' });

const props = withDefaults(
  defineProps<{
    /** Visible label. It is also the accessible name of the thumb. */
    label: string;
    /** Initial value when `v-model` is not used. Defaults to `min`. */
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    /** Adds a hidden input with this name so the value reaches a `<form>`. */
    name?: string;
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
  }>(),
  {
    defaultValue: undefined,
    min: 0,
    max: 100,
    step: 1,
    name: undefined,
    disabled: undefined,
    orientation: 'horizontal',
  },
);
const model = defineModel<number | undefined>({ default: undefined });
const emit = defineEmits<{
  /** Once, when the person stops dragging or releases a key. */
  commit: [value: number];
}>();

const api = useSliderRoot({
  value: () => model.value,
  defaultValue: () => props.defaultValue,
  min: () => props.min,
  max: () => props.max,
  step: () => props.step,
  name: () => props.name,
  disabled: () => props.disabled,
  orientation: () => props.orientation,
  onValueChange: (value) => (model.value = value),
  onValueCommit: (value) => emit('commit', value),
});
const resolved = computed(() => sliderVariants({ orientation: props.orientation }));
</script>

<template>
  <div :class="resolved.class" v-bind="{ ...api.getRootProps(), ...resolved.attrs }">
    <div class="t-slider__header">
      <label class="t-slider__label" v-bind="api.getLabelProps()">{{ label }}</label>
      <output class="t-slider__value" v-bind="api.getValueTextProps()">{{ api.value[0] }}</output>
    </div>
    <div class="t-slider__control" v-bind="api.getControlProps()">
      <div class="t-slider__track" v-bind="api.getTrackProps()">
        <div class="t-slider__range" v-bind="api.getRangeProps()" />
      </div>
      <div class="t-slider__thumb" v-bind="api.getThumbProps({ index: 0 })">
        <input v-bind="api.getHiddenInputProps({ index: 0 })" />
      </div>
    </div>
  </div>
</template>
