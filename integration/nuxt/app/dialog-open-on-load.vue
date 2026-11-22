<script setup lang="ts">
// The known limit from F3-progress §1: SSR + hydration + `default-open`. The dialog must end up open,
// trapping focus and closing with Escape after hydration.
import {
  TDialog,
  TDialogClose,
  TDialogContent,
  TDialogDescription,
  TDialogTitle,
} from '@tessen-ui/vue';
</script>

<template>
  <TDialog default-open>
    <TDialogContent>
      <TDialogTitle>Opened on load</TDialogTitle>
      <TDialogDescription>Rendered after hydration.</TDialogDescription>
      <TDialogClose>Close</TDialogClose>
    </TDialogContent>
  </TDialog>
</template>
