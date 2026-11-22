<script setup lang="ts">
import { toastVariants } from '@tessen-ui/core/contracts/toast';
import { computed } from 'vue';
import { useToastItem, type GroupService, type ToastItemProps } from './toast.zag.js';

defineOptions({ name: 'TToastItem' });

const props = defineProps<{ item: ToastItemProps; parent: GroupService; index: number }>();

const api = useToastItem(
  () => props.item,
  () => props.parent,
  () => props.index,
);
const resolved = computed(() =>
  toastVariants({
    type: (['info', 'success', 'warning', 'error', 'loading'] as const).find(
      (type) => type === api.value.type,
    ),
  }),
);
</script>

<template>
  <div :class="resolved.class" v-bind="api.getRootProps()">
    <div v-bind="api.getGhostBeforeProps()" />
    <div class="t-toast__body">
      <div v-if="api.title" class="t-toast__title" v-bind="api.getTitleProps()">
        {{ api.title }}
      </div>
      <div v-if="api.description" class="t-toast__description" v-bind="api.getDescriptionProps()">
        {{ api.description }}
      </div>
    </div>
    <button v-if="item.action" class="t-toast__action" v-bind="api.getActionTriggerProps()">
      {{ item.action.label }}
    </button>
    <button v-if="api.closable" class="t-toast__close" v-bind="api.getCloseTriggerProps()">
      <span aria-hidden="true">×</span>
    </button>
    <div v-bind="api.getGhostAfterProps()" />
  </div>
</template>
