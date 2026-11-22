<script setup lang="ts">
import { toggleButtonVariants } from '@tessen-ui/core/contracts/toggle-button';
import { computed } from 'vue';

defineOptions({ name: 'TToggleButton' });

const props = withDefaults(
  defineProps<{
    variant?: 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /** Initial state when `v-model:pressed` is not used. */
    defaultPressed?: boolean;
  }>(),
  { variant: undefined, size: undefined, defaultPressed: undefined },
);
const model = defineModel<boolean | undefined>('pressed', { default: undefined });
defineSlots<{ default?(): unknown }>();

const pressed = computed(() => model.value ?? props.defaultPressed ?? false);
const resolved = computed(() => toggleButtonVariants({ variant: props.variant, size: props.size }));

function toggle() {
  model.value = !pressed.value;
}
// A button with an on/off state. Its text must not change with the state.
</script>

<template>
  <button
    type="button"
    :class="resolved.class"
    v-bind="resolved.attrs"
    :disabled="disabled"
    :aria-pressed="pressed"
    :data-state="pressed ? 'on' : 'off'"
    @click="toggle"
  >
    <slot />
  </button>
</template>
