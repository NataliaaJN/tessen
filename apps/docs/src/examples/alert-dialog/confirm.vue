<script setup lang="ts">
import { TAlertDialog, TAlertDialogAction, TAlertDialogCancel, TAlertDialogContent, TAlertDialogDescription, TAlertDialogTitle, TAlertDialogTrigger } from '@tessen-ui/vue';
</script>

<template>
  <TAlertDialog>
    <TAlertDialogTrigger>Delete item</TAlertDialogTrigger>
    <TAlertDialogContent>
      <TAlertDialogTitle>Delete item?</TAlertDialogTitle>
      <TAlertDialogDescription>This cannot be undone.</TAlertDialogDescription>
      <TAlertDialogCancel>Keep</TAlertDialogCancel>
      <TAlertDialogAction tone="danger">Remove</TAlertDialogAction>
    </TAlertDialogContent>
  </TAlertDialog>
</template>
