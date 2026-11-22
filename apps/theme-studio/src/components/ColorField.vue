<script setup lang="ts">
import { isHex, normalizeHex } from '@tessen-ui/theme';
import { computed, ref, watch } from 'vue';

const props = defineProps<{ modelValue: string; label: string }>();
const emit = defineEmits<{ 'update:modelValue': [hex: string] }>();

const text = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (text.value = v),
);

const valid = computed(() => isHex(text.value));

function commitText(): void {
  if (isHex(text.value)) emit('update:modelValue', normalizeHex(text.value));
}

function onPick(event: Event): void {
  const hex = normalizeHex((event.target as HTMLInputElement).value);
  text.value = hex;
  emit('update:modelValue', hex);
}
</script>

<template>
  <span class="color-field">
    <input
      type="color"
      class="color-field__swatch"
      :value="modelValue.length === 7 ? modelValue : '#000000'"
      :aria-label="`${label}: selector de color`"
      @input="onPick"
    />
    <input
      v-model="text"
      class="color-field__hex"
      type="text"
      spellcheck="false"
      maxlength="7"
      :aria-label="`${label}: valor hexadecimal`"
      :aria-invalid="!valid"
      @input="commitText"
      @blur="text = valid ? normalizeHex(text) : modelValue"
    />
  </span>
</template>
