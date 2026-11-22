<script setup lang="ts">
import { fieldVariants } from '@tessen-ui/core/contracts/field';
import { computed, useId } from 'vue';
import { provideField } from '../../internal/field-context.js';

defineOptions({ name: 'TField' });

const props = defineProps<{
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Base id for the control; label, description and error derive theirs from it. */
  id?: string;
}>();
defineSlots<{ default?(): unknown }>();

const uid = useId();
const id = computed(() => props.id ?? `t-field-${uid}`);
provideField({
  id,
  labelId: computed(() => `${id.value}-label`),
  descriptionId: computed(() => `${id.value}-description`),
  errorId: computed(() => `${id.value}-error`),
  invalid: computed(() => props.invalid),
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
  readOnly: computed(() => props.readOnly),
});

const resolved = computed(() =>
  fieldVariants({
    invalid: props.invalid,
    required: props.required,
    disabled: props.disabled,
    readOnly: props.readOnly,
  }),
);
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs"><slot /></div>
</template>
