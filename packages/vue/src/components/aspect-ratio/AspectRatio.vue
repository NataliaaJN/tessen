<script setup lang="ts">
import { aspectRatioVariants } from '@tessen-ui/core/contracts/aspect-ratio';
import { computed } from 'vue';

defineOptions({ name: 'TAspectRatio' });

const props = withDefaults(
  defineProps<{
    ratio?: '1/1' | '4/3' | '3/2' | '16/9' | '21/9';
  }>(),
  { ratio: undefined },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => aspectRatioVariants({ ratio: props.ratio }));
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs"><slot /></div>
</template>
