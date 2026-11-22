<script setup lang="ts">
import { buttonVariants } from '@tessen-ui/core/contracts/button';
import { computed } from 'vue';
import type { ButtonProps } from './button.types.js';

defineOptions({ name: 'TButton' });

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'button',
  // Left undefined so that `buttonVariants` (the contract) owns the defaults.
  variant: undefined,
  size: undefined,
  tone: undefined,
});
const emit = defineEmits<{ click: [event: MouseEvent] }>();
defineSlots<{ default?(): unknown; leading?(): unknown; trailing?(): unknown }>();

const resolved = computed(() =>
  buttonVariants({
    variant: props.variant,
    size: props.size,
    tone: props.tone,
    block: props.block,
  }),
);

function onClick(event: MouseEvent) {
  if (props.loading) return event.preventDefault();
  emit('click', event);
}
</script>

<template>
  <button
    :class="resolved.class"
    v-bind="resolved.attrs"
    :type="type"
    :disabled="disabled"
    :aria-busy="loading || undefined"
    :aria-disabled="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="t-button__spinner" aria-hidden="true" />
    <span v-if="$slots.leading" class="t-button__icon"><slot name="leading" /></span>
    <span class="t-button__label"><slot /></span>
    <span v-if="$slots.trailing" class="t-button__icon"><slot name="trailing" /></span>
  </button>
</template>
