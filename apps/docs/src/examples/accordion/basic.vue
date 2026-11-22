<script setup lang="ts">
import { TAccordion, TAccordionItem, TAccordionTrigger, TAccordionContent } from '@tessen-ui/vue';
</script>

<template>
  <TAccordion :default-value="['one']" variant="bordered">
    <TAccordionItem value="one">
      <TAccordionTrigger>First</TAccordionTrigger>
      <TAccordionContent>First content</TAccordionContent>
    </TAccordionItem>
    <TAccordionItem value="two">
      <TAccordionTrigger>Second</TAccordionTrigger>
      <TAccordionContent>Second content</TAccordionContent>
    </TAccordionItem>
  </TAccordion>
</template>
