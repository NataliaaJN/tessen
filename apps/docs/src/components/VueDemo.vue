<script setup lang="ts">
// Hydratable wrapper: renders the Vue example `src/examples/<slug>/<id>.vue`.
import type { Component } from 'vue';

const props = defineProps<{ slug: string; id: string }>();
const modules = import.meta.glob<{ default: Component }>('../examples/*/*.vue', { eager: true });
const Example = modules[`../examples/${props.slug}/${props.id}.vue`]?.default;
</script>

<template>
  <component :is="Example" v-if="Example" />
</template>
