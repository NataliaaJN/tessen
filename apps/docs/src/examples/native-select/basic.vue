<script setup lang="ts">
import { TField, TFieldLabel, TNativeSelect } from '@tessen-ui/vue';
</script>

<template>
  <TField>
    <TFieldLabel>Country</TFieldLabel>
    <TNativeSelect default-value="fr">
      <option value="es">Spain</option>
      <option value="fr">France</option>
    </TNativeSelect>
  </TField>
</template>
