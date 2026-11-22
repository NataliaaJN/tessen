<script setup lang="ts">
import {
  TField,
  TFieldLabel,
  TFieldDescription,
  TFieldError,
  TInput,
  TStack,
} from '@tessen-ui/vue';
</script>

<template>
  <TStack gap="4">
    <TField required>
      <TFieldLabel>Email</TFieldLabel>
      <TInput type="email" placeholder="you@example.com" />
      <TFieldDescription>We never share it.</TFieldDescription>
    </TField>
    <TField invalid>
      <TFieldLabel>Name</TFieldLabel>
      <TInput default-value="x" />
      <TFieldError>Too short</TFieldError>
    </TField>
  </TStack>
</template>
