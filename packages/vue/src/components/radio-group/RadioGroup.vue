<script setup lang="ts">
import { radioGroupVariants } from '@tessen-ui/core/contracts/radio-group';
import { computed, useId } from 'vue';
import { useField } from '../../internal/field-context.js';
import { provideRadioGroup } from './radio-group-context.js';

defineOptions({ name: 'TRadioGroup' });

const props = withDefaults(
  defineProps<{
    orientation?: 'vertical' | 'horizontal';
    /** Shared `name` of the radios (form participation). Generated when omitted. */
    name?: string;
    invalid?: boolean;
    disabled?: boolean;
    /** Initial value when `v-model` is not used. */
    defaultValue?: string;
  }>(),
  { orientation: undefined, name: undefined, defaultValue: undefined },
);
const model = defineModel<string>();
defineSlots<{ default?(): unknown }>();

const uid = useId();
const field = useField();
const invalid = computed(() => props.invalid || !!field?.invalid.value);
const disabled = computed(() => props.disabled || !!field?.disabled.value);
const value = computed(() => model.value ?? props.defaultValue);

provideRadioGroup({
  name: computed(() => props.name ?? `t-radio-${uid}`),
  value,
  disabled,
  invalid,
  select: (next) => (model.value = next),
});

const resolved = computed(() =>
  radioGroupVariants({ orientation: props.orientation, invalid: invalid.value }),
);
</script>

<template>
  <div
    :class="resolved.class"
    v-bind="resolved.attrs"
    role="radiogroup"
    :data-disabled="disabled ? '' : undefined"
    :aria-invalid="invalid || undefined"
  >
    <slot />
  </div>
</template>
