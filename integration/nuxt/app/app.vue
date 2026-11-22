<script setup lang="ts">
// Rendered on the server and hydrated. Uses only the public entry point of @tessen-ui/vue.
import {
  TAccordion,
  TAccordionContent,
  TAccordionItem,
  TAccordionTrigger,
  TButton,
  TProgress,
  TSelect,
  TStack,
  TTab,
  TTabList,
  TTabPanel,
  TTabs,
} from '@tessen-ui/vue';
import DialogOpenOnLoad from './dialog-open-on-load.vue';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];
</script>

<template>
  <main>
    <TStack gap="4">
      <h1>SSR consumer</h1>
      <TButton tone="danger">Save</TButton>
      <TTabs default-value="b">
        <TTabList aria-label="Sections">
          <TTab value="a">First</TTab>
          <TTab value="b">Second</TTab>
        </TTabList>
        <TTabPanel value="a">Panel A</TTabPanel>
        <TTabPanel value="b">Panel B</TTabPanel>
      </TTabs>
      <TSelect :items="fruits" label="Fruit" default-value="banana" />
      <TAccordion :default-value="['one']">
        <TAccordionItem value="one">
          <TAccordionTrigger>One</TAccordionTrigger>
          <TAccordionContent>Open on the server</TAccordionContent>
        </TAccordionItem>
      </TAccordion>
      <TProgress :value="40" aria-label="Upload" />
      <DialogOpenOnLoad />
    </TStack>
  </main>
</template>
