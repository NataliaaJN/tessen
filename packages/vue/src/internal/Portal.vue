<script setup lang="ts">
import { onMounted, ref } from 'vue';

defineOptions({ name: 'TPortal' });
defineSlots<{ default?(): unknown }>();

// Not rendered until mounted: the server and the first client render agree (no hydration mismatch).
const mounted = ref(false);
onMounted(() => (mounted.value = true));
</script>

<template>
  <Teleport v-if="mounted" to="body"><slot /></Teleport>
</template>
