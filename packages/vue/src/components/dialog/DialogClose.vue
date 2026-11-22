<script setup lang="ts">
import { useDialog } from '../../internal/dialog.zag.js';

defineOptions({ name: 'TDialogClose' });
defineSlots<{ default?(): unknown }>();

const { api } = useDialog();
</script>

<template>
  <button type="button" class="t-dialog__close" v-bind="api.getCloseTriggerProps()">
    <slot />
  </button>
</template>
