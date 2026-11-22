<script setup lang="ts">
import { useDialog } from '../../internal/dialog.zag.js';

defineOptions({ name: 'TDialogDescription' });
defineSlots<{ default?(): unknown }>();

const { api } = useDialog();
</script>

<template>
  <p class="t-dialog__description" v-bind="api.getDescriptionProps()"><slot /></p>
</template>
