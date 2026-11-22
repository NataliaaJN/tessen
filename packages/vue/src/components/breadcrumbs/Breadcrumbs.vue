<script setup lang="ts">
import { breadcrumbsVariants } from '@tessen-ui/core/contracts/breadcrumbs';

defineOptions({ name: 'TBreadcrumbs' });

// A navigation landmark with an ordered list of `TBreadcrumbItem`s; `aria-label` falls back to "Breadcrumb".
withDefaults(defineProps<{ ariaLabel?: string }>(), { ariaLabel: 'Breadcrumb' });
defineSlots<{ default?(): unknown }>();

const resolved = breadcrumbsVariants();
</script>

<template>
  <nav :class="resolved.class" v-bind="resolved.attrs" :aria-label="ariaLabel">
    <ol class="t-breadcrumbs__list">
      <slot />
    </ol>
  </nav>
</template>
