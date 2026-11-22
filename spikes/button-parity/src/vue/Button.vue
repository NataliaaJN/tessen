<script setup lang="ts">
import { computed } from 'vue';
import { buttonVariants } from '../core/button.contract.ts';

defineOptions({ name: 'TButton' });

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
    tone?: 'default' | 'danger';
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  // Vue casts an absent Boolean prop to false, which keeps the variants' defaults intact.
  { type: 'button', variant: undefined, size: undefined, tone: undefined },
);
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const v = computed(() =>
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
    :class="v.class"
    v-bind="v.attrs"
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
