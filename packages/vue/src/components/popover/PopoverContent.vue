<script setup lang="ts">
import { popoverVariants } from '@tessen-ui/core/contracts/popover';
import { computed } from 'vue';
import Portal from '../../internal/Portal.vue';
import { usePopover } from './popover.zag.js';

defineOptions({ name: 'TPopoverContent' });
defineSlots<{ default?(): unknown }>();

const { api, presence, placement } = usePopover();
const resolved = computed(() => popoverVariants({ placement: placement.value }));
</script>

<template>
  <Portal>
    <div
      v-if="api.open || presence.present"
      class="t-popover__positioner"
      v-bind="api.getPositionerProps()"
    >
      <div
        :class="resolved.class"
        :ref="(el) => presence.setNode(el as HTMLElement | null)"
        v-bind="api.getContentProps()"
        :data-placement="resolved.attrs['data-placement']"
        :data-state="api.open ? 'open' : 'closed'"
        :hidden="false"
      >
        <slot />
      </div>
    </div>
  </Portal>
</template>
