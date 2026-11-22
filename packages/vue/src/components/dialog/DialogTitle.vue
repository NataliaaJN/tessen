<script setup lang="ts">
import { useDialog } from '../../internal/dialog.zag.js';

defineOptions({ name: 'TDialogTitle' });
defineSlots<{ default?(): unknown }>();

const { api } = useDialog();
</script>

<template>
  <h2 class="t-dialog__title" v-bind="api.getTitleProps()"><slot /></h2>
</template>
