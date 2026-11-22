<script setup lang="ts">
// Uses only the public entry points. The contract cases and `defineContract` are NOT used here
// on purpose: the build check asserts they are tree-shaken out of the bundle.
import { CheckIcon } from '@tessen-ui/icons/vue';
import {
  TAlert,
  TButton,
  TCheckbox,
  TDialog,
  TDialogClose,
  TDialogContent,
  TDialogDescription,
  TDialogTitle,
  TDialogTrigger,
  TField,
  TFieldDescription,
  TFieldError,
  TFieldLabel,
  TInput,
  TStack,
  TTab,
  TTabList,
  TTabPanel,
  TTabs,
} from '@tessen-ui/vue';
import { ref } from 'vue';

const email = ref('');
const accepted = ref(false);
</script>

<template>
  <TStack gap="4">
    <TTabs>
      <TTabList aria-label="Sections">
        <TTab value="account">Account</TTab>
        <TTab value="billing">Billing</TTab>
      </TTabList>
      <TTabPanel value="account">
        <TField :invalid="email === ''" required>
          <TFieldLabel>Email</TFieldLabel>
          <TInput v-model="email" type="email" />
          <TFieldDescription>We never share it.</TFieldDescription>
          <TFieldError>Required</TFieldError>
        </TField>
        <TCheckbox v-model="accepted">Accept the terms</TCheckbox>
      </TTabPanel>
      <TTabPanel value="billing">
        <TAlert tone="info" title="Heads up">Billing is read-only.</TAlert>
      </TTabPanel>
    </TTabs>

    <TButton tone="danger" block>
      <template #leading><CheckIcon :size="16" /></template>
      Save
    </TButton>

    <TDialog>
      <TDialogTrigger>Delete account</TDialogTrigger>
      <TDialogContent>
        <TDialogTitle>Delete account?</TDialogTitle>
        <TDialogDescription>This cannot be undone.</TDialogDescription>
        <TDialogClose>Cancel</TDialogClose>
      </TDialogContent>
    </TDialog>
  </TStack>
</template>
