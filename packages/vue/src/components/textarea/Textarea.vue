<script setup lang="ts">
import { textareaVariants } from '@tessen-ui/core/contracts/textarea';
import { computed, useAttrs } from 'vue';
import { useControlState } from '../../internal/field-context.js';

defineOptions({ name: 'TTextarea', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    invalid?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    /** Initial value when `v-model` is not used. */
    defaultValue?: string;
    id?: string;
  }>(),
  { size: undefined, defaultValue: undefined, id: undefined },
);
const model = defineModel<string>();

const attrs = useAttrs();
const state = useControlState(props);
const resolved = computed(() =>
  textareaVariants({ size: props.size, invalid: state.invalid.value }),
);
const value = computed(() => model.value ?? props.defaultValue ?? '');
const describedBy = computed(
  () => [attrs['aria-describedby'], state.describedBy.value].filter(Boolean).join(' ') || undefined,
);

function onInput(event: Event) {
  model.value = (event.target as HTMLTextAreaElement).value;
}
</script>

<template>
  <textarea
    v-bind="{ ...attrs, ...resolved.attrs }"
    :id="state.id.value"
    :class="resolved.class"
    :value="value"
    :disabled="state.disabled.value"
    :readonly="state.readOnly.value"
    :required="state.required.value"
    :aria-invalid="state.invalid.value || undefined"
    :aria-describedby="describedBy"
    @input="onInput"
  />
</template>
