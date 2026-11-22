<script setup lang="ts">
import { dividerVariants } from '@tessen-ui/core/contracts/divider';
import { computed } from 'vue';

defineOptions({ name: 'TDivider' });

const props = withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical';
    /** Purely visual: removes the separator from the accessibility tree. */
    decorative?: boolean;
  }>(),
  { orientation: undefined },
);

const resolved = computed(() => dividerVariants({ orientation: props.orientation }));
const vertical = computed(() => props.orientation === 'vertical');
</script>

<template>
  <div
    v-if="vertical"
    :class="resolved.class"
    v-bind="resolved.attrs"
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="decorative ? undefined : 'vertical'"
  />
  <hr
    v-else
    :class="resolved.class"
    v-bind="resolved.attrs"
    :role="decorative ? 'none' : undefined"
  />
</template>
