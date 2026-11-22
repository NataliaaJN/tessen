<script setup lang="ts">
import { visuallyHiddenVariants } from '@tessen-ui/core/contracts/visually-hidden';
import { computed } from 'vue';

defineOptions({ name: 'TVisuallyHidden' });

const props = defineProps<{
  /** Becomes visible while it or a descendant has focus (skip links). */
  focusable?: boolean;
}>();
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => visuallyHiddenVariants({ focusable: props.focusable }));
</script>

<template>
  <span :class="resolved.class" v-bind="resolved.attrs"><slot /></span>
</template>
