<script setup lang="ts">
import { iconButtonVariants } from '@tessen-ui/core/contracts/icon-button';
import { computed } from 'vue';

defineOptions({ name: 'TIconButton' });

const props = withDefaults(
  defineProps<{
    /** Accessible name. Required: an icon alone has no name. */
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    tone?: 'default' | 'danger';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  { type: 'button', variant: undefined, size: undefined, tone: undefined },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() =>
  iconButtonVariants({ variant: props.variant, size: props.size, tone: props.tone }),
);
</script>

<template>
  <button
    :class="resolved.class"
    v-bind="resolved.attrs"
    :type="type"
    :disabled="disabled"
    :aria-label="label"
  >
    <span class="t-icon-button__icon" aria-hidden="true"><slot /></span>
  </button>
</template>
