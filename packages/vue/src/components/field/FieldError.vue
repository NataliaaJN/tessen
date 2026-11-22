<script setup lang="ts">
import { useField } from '../../internal/field-context.js';

defineOptions({ name: 'TFieldError' });
defineSlots<{ default?(): unknown }>();

const field = useField();
</script>

<template>
  <!-- Only present while the field is invalid: it is then announced as it appears. -->
  <p
    v-if="field?.invalid.value"
    :id="field.errorId.value"
    class="t-field__error"
    aria-live="polite"
  >
    <slot />
  </p>
</template>
