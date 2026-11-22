<script setup lang="ts">
import Portal from '../../internal/Portal.vue';
import ToastItem from './ToastItem.vue';
import { useToasterRoot, type Toaster } from './toast.zag.js';

// The root is a Portal, so attributes go to the region by hand.
defineOptions({ name: 'TToaster', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The handle made once with `createToaster()`; call it from anywhere to show a toast. */
    toaster: Toaster;
    /** Accessible name of the notifications region. */
    label?: string;
  }>(),
  { label: 'Notifications' },
);

const { service, api } = useToasterRoot(() => props.toaster);
</script>

<template>
  <Portal>
    <div class="t-toaster" v-bind="{ ...api.getGroupProps({ label }), ...$attrs }">
      <ToastItem
        v-for="(item, index) in api.getToasts()"
        :key="item.id"
        :item="item"
        :parent="service"
        :index="index"
      />
    </div>
  </Portal>
</template>
