<script setup lang="ts">
import { TDropdownMenu, TDropdownMenuContent, TDropdownMenuItem, TDropdownMenuSeparator, TDropdownMenuTrigger } from '@tessen-ui/vue';
</script>

<template>
  <TDropdownMenu>
    <TDropdownMenuTrigger>Actions</TDropdownMenuTrigger>
    <TDropdownMenuContent>
      <TDropdownMenuItem value="edit">Edit</TDropdownMenuItem>
      <TDropdownMenuItem value="duplicate" disabled>Duplicate</TDropdownMenuItem>
      <TDropdownMenuSeparator />
      <TDropdownMenuItem value="delete">Delete</TDropdownMenuItem>
    </TDropdownMenuContent>
  </TDropdownMenu>
</template>
