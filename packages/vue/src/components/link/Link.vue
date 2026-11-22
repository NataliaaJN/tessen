<script setup lang="ts">
import { linkVariants } from '@tessen-ui/core/contracts/link';
import { computed } from 'vue';

defineOptions({ name: 'TLink' });

const props = withDefaults(
  defineProps<{
    href: string;
    variant?: 'inline' | 'standalone';
    /** Opens in a new tab with `rel="noopener noreferrer"` and announces it. */
    external?: boolean;
    /** Text announced for external links. */
    externalLabel?: string;
  }>(),
  { variant: undefined, externalLabel: '(opens in a new tab)' },
);
defineSlots<{ default?(): unknown }>();

const resolved = computed(() => linkVariants({ variant: props.variant, external: props.external }));
</script>

<template>
  <a
    :class="resolved.class"
    v-bind="resolved.attrs"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <slot />
    <span v-if="external" class="t-link__external">{{ externalLabel }}</span>
  </a>
</template>
