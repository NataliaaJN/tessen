<script setup lang="ts">
defineOptions({ name: 'TBreadcrumbItem', inheritAttrs: false });

defineProps<{
  href?: string;
  /** The page being shown: rendered as text with `aria-current="page"`, not as a link. */
  current?: boolean;
}>();
defineSlots<{ default?(): unknown }>();
</script>

<template>
  <li class="t-breadcrumbs__item">
    <span
      v-if="current || href === undefined"
      v-bind="$attrs"
      class="t-breadcrumbs__current"
      :aria-current="current ? 'page' : undefined"
    >
      <slot />
    </span>
    <a v-else v-bind="$attrs" class="t-breadcrumbs__link" :href="href"><slot /></a>
  </li>
</template>
