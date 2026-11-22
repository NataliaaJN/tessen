<script setup lang="ts">
import { dialogVariants } from '@tessen-ui/core/contracts/dialog';
import { computed } from 'vue';
import Portal from '../../internal/Portal.vue';
import { useDialog } from './dialog.zag.js';

defineOptions({ name: 'TDialogContent' });

const props = withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: undefined });
defineSlots<{ default?(): unknown }>();

const { api, presence } = useDialog();
const resolved = computed(() => dialogVariants({ size: props.size }));
const state = computed(() => (api.value.open ? 'open' : 'closed'));
</script>

<template>
  <Portal>
    <div
      v-if="api.open || presence.present"
      :class="resolved.class"
      v-bind="resolved.attrs"
      :data-state="state"
    >
      <div class="t-dialog__backdrop" v-bind="api.getBackdropProps()" />
      <div class="t-dialog__positioner" v-bind="api.getPositionerProps()">
        <div
          class="t-dialog__content"
          :ref="(el) => presence.setNode(el as HTMLElement | null)"
          v-bind="api.getContentProps()"
          :data-state="state"
          :hidden="false"
        >
          <slot />
        </div>
      </div>
    </div>
  </Portal>
</template>
