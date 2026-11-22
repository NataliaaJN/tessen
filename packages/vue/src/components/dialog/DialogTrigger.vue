<script setup lang="ts">
import { useDialog } from '../../internal/dialog.zag.js';

defineOptions({ name: 'TDialogTrigger' });
defineSlots<{ default?(): unknown }>();

const { api } = useDialog();
</script>

<template>
  <button type="button" class="t-dialog__trigger" v-bind="api.getTriggerProps()">
    <slot />
  </button>
</template>
