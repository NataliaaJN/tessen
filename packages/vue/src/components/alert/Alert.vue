<script setup lang="ts">
import { alertRoles, alertVariants } from '@tessen-ui/core/contracts/alert';
import { computed } from 'vue';

defineOptions({ name: 'TAlert' });

const props = withDefaults(
  defineProps<{
    tone?: 'info' | 'success' | 'warning' | 'danger';
    title?: string;
  }>(),
  { tone: undefined, title: undefined },
);
defineSlots<{ default?(): unknown; icon?(): unknown }>();

const resolved = computed(() => alertVariants({ tone: props.tone }));
// `warning` and `danger` interrupt the reader; `info` and `success` wait their turn.
const role = computed(() => alertRoles[props.tone ?? 'info']);
</script>

<template>
  <div :class="resolved.class" v-bind="resolved.attrs" :role="role">
    <span v-if="$slots.icon" class="t-alert__icon" aria-hidden="true"><slot name="icon" /></span>
    <div class="t-alert__content">
      <div v-if="title" class="t-alert__title">{{ title }}</div>
      <div class="t-alert__body"><slot /></div>
    </div>
  </div>
</template>
