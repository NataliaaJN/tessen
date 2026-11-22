<script setup lang="ts">
import { skeletonVariants } from '@tessen-ui/core/contracts/skeleton';
import { computed } from 'vue';

defineOptions({ name: 'TSkeleton' });

const props = withDefaults(
  defineProps<{
    shape?: 'text' | 'rect' | 'circle';
    animated?: boolean;
  }>(),
  { shape: undefined, animated: true },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => skeletonVariants({ shape: props.shape, animated: props.animated }));
</script>

<template>
  <span :class="resolved.class" v-bind="resolved.attrs" aria-hidden="true"><slot /></span>
</template>
