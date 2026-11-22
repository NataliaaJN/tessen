<script setup lang="ts">
import { buttonGroupVariants } from '@tessen-ui/core/contracts/toggle-button';
import { computed } from 'vue';

defineOptions({ name: 'TButtonGroup' });

const props = withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical';
    attached?: boolean;
  }>(),
  { orientation: undefined },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() =>
  buttonGroupVariants({ orientation: props.orientation, attached: props.attached }),
);
// Give it an aria-label: it is exposed as role="group".
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs" role="group"><slot /></div>
</template>
