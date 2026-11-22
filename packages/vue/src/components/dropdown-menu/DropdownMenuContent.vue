<script setup lang="ts">
import { dropdownMenuVariants } from '@tessen-ui/core/contracts/dropdown-menu';
import Portal from '../../internal/Portal.vue';
import { useDropdownMenu } from './dropdown-menu.zag.js';

defineOptions({ name: 'TDropdownMenuContent' });
defineSlots<{ default?(): unknown }>();

const { api, presence } = useDropdownMenu();
const resolved = dropdownMenuVariants({});
</script>

<template>
  <Portal>
    <div
      v-if="api.open || presence.present"
      class="t-menu__positioner"
      v-bind="api.getPositionerProps()"
    >
      <div
        :class="resolved.class"
        :ref="(el) => presence.setNode(el as HTMLElement | null)"
        v-bind="api.getContentProps()"
        :data-state="api.open ? 'open' : 'closed'"
        :hidden="false"
      >
        <slot />
      </div>
    </div>
  </Portal>
</template>
