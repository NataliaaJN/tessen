<script setup lang="ts">
import { listVariants } from '@tessen-ui/core/contracts/list';
import { computed } from 'vue';

defineOptions({ name: 'TList' });

const props = withDefaults(
  defineProps<{
    variant?: 'plain' | 'divided' | 'bulleted';
    ordered?: boolean;
  }>(),
  { variant: undefined },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => listVariants({ variant: props.variant, ordered: props.ordered }));
// role="list" keeps the list semantics when the markers are removed.
</script>

<template>
  <ol v-if="ordered" :class="resolved.class" v-bind="resolved.attrs" role="list">
    <slot />
  </ol>
  <ul v-else :class="resolved.class" v-bind="resolved.attrs" role="list">
    <slot />
  </ul>
</template>
