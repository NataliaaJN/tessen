<script setup lang="ts">
import { TStack } from '@tessen-ui/vue';

const styles = [
  'display-lg',
  'display-md',
  'heading-xl',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'heading-xs',
  'body-lg',
  'body-md',
  'body-sm',
  'label-lg',
  'label-md',
  'label-sm',
  'caption',
  'code',
];

const rule = (name: string): Record<string, string> => ({
  fontFamily: `var(--tessen-typography-${name}-font-family)`,
  fontSize: `var(--tessen-typography-${name}-font-size)`,
  fontWeight: `var(--tessen-typography-${name}-font-weight)`,
  lineHeight: `var(--tessen-typography-${name}-line-height)`,
  letterSpacing: `var(--tessen-typography-${name}-letter-spacing)`,
});
</script>

<template>
  <TStack gap="5">
    <div v-for="s in styles" :key="s" class="type-row">
      <code class="type-name">{{ s }}</code>
      <span :style="rule(s)">El veloz murciélago hindú comía feliz cardillo y kiwi</span>
    </div>
    <p class="muted">
      Las familias se cambian en el panel «Tipografía». Los tamaños salen de la escala de tokens.
    </p>
  </TStack>
</template>
