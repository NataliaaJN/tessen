<script setup lang="ts">
import {
  TDialog,
  TDialogTrigger,
  TDialogContent,
  TDialogTitle,
  TDialogDescription,
  TDialogClose,
} from '@tessen-ui/vue';
</script>

<template>
  <TDialog>
    <TDialogTrigger>Delete account</TDialogTrigger>
    <TDialogContent>
      <TDialogTitle>Delete account?</TDialogTitle>
      <TDialogDescription>This cannot be undone.</TDialogDescription>
      <TDialogClose>Cancel</TDialogClose>
    </TDialogContent>
  </TDialog>
</template>
