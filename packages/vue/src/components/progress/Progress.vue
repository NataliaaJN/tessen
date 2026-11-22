<script setup lang="ts">
import { progressPercent, progressVariants } from '@tessen-ui/core/contracts/progress';
import { computed } from 'vue';

defineOptions({ name: 'TProgress' });

const props = withDefaults(
  defineProps<{
    /** Current value; leave it out for an indeterminate progress. */
    value?: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    tone?: 'brand' | 'success' | 'warning' | 'danger';
  }>(),
  { value: undefined, max: 100, size: undefined, tone: undefined },
);

const resolved = computed(() => progressVariants({ size: props.size, tone: props.tone }));
const percent = computed(() => progressPercent(props.value, props.max));
const now = computed(() =>
  percent.value === undefined ? undefined : (percent.value / 100) * props.max,
);
</script>

<template>
  <div
    :class="resolved.class"
    v-bind="resolved.attrs"
    role="progressbar"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="now"
    :data-state="percent === undefined ? 'indeterminate' : 'determinate'"
    :style="{ '--_value': `${percent ?? 0}%` }"
  >
    <div class="t-progress__bar" />
  </div>
</template>
