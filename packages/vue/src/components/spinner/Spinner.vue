<script setup lang="ts">
import { spinnerVariants } from '@tessen-ui/core/contracts/spinner';
import { computed } from 'vue';

defineOptions({ name: 'TSpinner' });

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    /** Text announced to assistive technology. */
    label?: string;
  }>(),
  { size: undefined, label: 'Loading' },
);

const resolved = computed(() => spinnerVariants({ size: props.size }));
</script>

<template>
  <span :class="resolved.class" v-bind="resolved.attrs" role="status">
    <span class="t-spinner__circle" aria-hidden="true" />
    <span class="t-spinner__label">{{ label }}</span>
  </span>
</template>
