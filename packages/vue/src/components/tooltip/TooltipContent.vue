<script setup lang="ts">
import { tooltipVariants } from '@tessen-ui/core/contracts/tooltip';
import { computed } from 'vue';
import Portal from '../../internal/Portal.vue';
import { useTooltip } from './tooltip.zag.js';

defineOptions({ name: 'TTooltipContent' });
defineSlots<{ default?(): unknown }>();

const { api, presence, placement } = useTooltip();
const resolved = computed(() =>
  tooltipVariants({ placement: placement.value as 'top' | 'bottom' | 'left' | 'right' }),
);
</script>

<template>
  <Portal>
    <div
      v-if="api.open || presence.present"
      class="t-tooltip__positioner"
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
