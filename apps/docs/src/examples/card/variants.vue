<script setup lang="ts">
import { TCard, TGrid } from '@tessen-ui/vue';
</script>

<template>
  <TGrid columns="2" gap="4">
    <TCard variant="outlined"><template #header>Outlined</template>Body<template #footer>Footer</template></TCard>
    <TCard variant="elevated" padding="lg">Elevated, large padding</TCard>
    <TCard variant="filled" padding="sm">Filled, small padding</TCard>
    <TCard padding="none">No padding</TCard>
  </TGrid>
</template>
