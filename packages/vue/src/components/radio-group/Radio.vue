<script setup lang="ts">
import { radioVariants } from '@tessen-ui/core/contracts/radio-group';
import { computed, useAttrs } from 'vue';
import { useRadioGroup } from './radio-group-context.js';

defineOptions({ name: 'TRadio', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    value: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
  }>(),
  { size: undefined },
);
defineSlots<{ default?(): unknown }>();

const attrs = useAttrs();
const group = useRadioGroup();
const resolved = computed(() => radioVariants({ size: props.size }));
const checked = computed(() => group?.value.value === props.value);
// `class` and `style` style the wrapping label; everything else is a native attribute of the input.
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
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
      class="t-radio__input"
      type="radio"
      :name="group?.name.value"
      :value="value"
      :checked="checked"
      :disabled="disabled || group?.disabled.value"
      :aria-invalid="group?.invalid.value || undefined"
      @change="group?.select(value)"
    />
    <span class="t-radio__circle" aria-hidden="true"><span class="t-radio__dot" /></span>
    <span v-if="$slots.default" class="t-radio__label"><slot /></span>
  </label>
</template>
