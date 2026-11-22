<script setup lang="ts">
import { buttonVariants } from '@tessen-ui/core/contracts/button';
import { computed } from 'vue';
import { useDialog } from '../../internal/dialog.zag.js';

// It closes the dialog; the consumer runs the work in @click. Use tone="danger" when destructive.
defineOptions({ name: 'TAlertDialogAction' });

const props = defineProps<{ size?: 'sm' | 'md' | 'lg'; tone?: 'default' | 'danger' }>();
defineSlots<{ default?(): unknown }>();

const { api } = useDialog();
const resolved = computed(() =>
  buttonVariants({ variant: 'primary', size: props.size, tone: props.tone }),
);
</script>

<template>
  <button
    type="button"
    :class="[resolved.class, 't-alert-dialog__action']"
    v-bind="{ ...api.getCloseTriggerProps(), ...resolved.attrs }"
  >
    <slot />
  </button>
</template>
