<script setup lang="ts">
defineOptions({ name: 'TListItem' });
defineSlots<{ default?(): unknown }>();
</script>

<template>
  <li class="t-list__item"><slot /></li>
</template>
