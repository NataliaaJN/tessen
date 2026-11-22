<script setup lang="ts">
import { useField } from '../../internal/field-context.js';

defineOptions({ name: 'TFieldLabel' });
defineSlots<{ default?(): unknown }>();

const field = useField();
</script>

<template>
  <label :id="field?.labelId.value" :for="field?.id.value" class="t-field__label">
    <slot /><span v-if="field?.required.value" class="t-field__required" aria-hidden="true">*</span>
  </label>
</template>
