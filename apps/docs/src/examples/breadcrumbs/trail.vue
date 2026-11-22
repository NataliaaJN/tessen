<script setup lang="ts">
import { TBreadcrumbItem, TBreadcrumbs } from '@tessen-ui/vue';
</script>

<template>
  <TBreadcrumbs>
    <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
    <TBreadcrumbItem href="/components/">Components</TBreadcrumbItem>
    <TBreadcrumbItem current>Button</TBreadcrumbItem>
  </TBreadcrumbs>
</template>
