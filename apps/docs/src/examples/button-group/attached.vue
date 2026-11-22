<script setup lang="ts">
import { TButtonGroup, TToggleButton } from '@tessen-ui/vue';
</script>

<template>
  <TButtonGroup aria-label="Align" attached>
    <TToggleButton>Left</TToggleButton>
    <TToggleButton default-pressed>Center</TToggleButton>
    <TToggleButton>Right</TToggleButton>
  </TButtonGroup>
</template>
