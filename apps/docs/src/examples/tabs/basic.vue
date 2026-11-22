<script setup lang="ts">
import { TTabs, TTabList, TTab, TTabPanel } from '@tessen-ui/vue';
</script>

<template>
  <TTabs default-value="b">
    <TTabList aria-label="Sections">
      <TTab value="a">Account</TTab>
      <TTab value="b">Billing</TTab>
      <TTab value="c">Team</TTab>
    </TTabList>
    <TTabPanel value="a">Account panel</TTabPanel>
    <TTabPanel value="b">Billing panel</TTabPanel>
    <TTabPanel value="c">Team panel</TTabPanel>
  </TTabs>
</template>
