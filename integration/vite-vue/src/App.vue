<script setup lang="ts">
// Uses only the public subpaths. The contract cases and `defineContract` are NOT used here
// on purpose: the build check asserts they are tree-shaken out of the bundle.
import { buttonVariants } from '@tessen-ui/core/contracts/button';
import { CheckIcon } from '@tessen-ui/icons/vue';

const result = buttonVariants({ variant: 'primary', tone: 'danger', block: true });
</script>

<template>
  <button type="button" :class="result.class" v-bind="result.attrs">
    <CheckIcon :size="16" />
    Save
  </button>
</template>
