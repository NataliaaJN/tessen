<script setup lang="ts">
import { TRadio, TRadioGroup } from '@tessen-ui/vue';
</script>

<template>
  <TRadioGroup aria-label="Plan" default-value="pro" orientation="horizontal">
    <TRadio value="free">Free</TRadio>
    <TRadio value="pro">Pro</TRadio>
    <TRadio value="team">Team</TRadio>
  </TRadioGroup>
</template>
