<script setup lang="ts">
import { useField } from '../../internal/field-context.js';

defineOptions({ name: 'TFieldDescription' });
defineSlots<{ default?(): unknown }>();

const field = useField();
</script>

<template>
  <p :id="field?.descriptionId.value" class="t-field__description"><slot /></p>
</template>
