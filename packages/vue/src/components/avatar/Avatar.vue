<script setup lang="ts">
import { avatarInitials, avatarVariants } from '@tessen-ui/core/contracts/avatar';
import { computed, ref } from 'vue';

defineOptions({ name: 'TAvatar' });

const props = withDefaults(
  defineProps<{
    src?: string;
    /** Alt text of the image. Defaults to `name`. */
    alt?: string;
    /** The person or thing: names the avatar and gives the initials of the fallback. */
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'circle' | 'square';
  }>(),
  { src: undefined, alt: undefined, name: undefined, size: undefined, shape: undefined },
);

const failed = ref<string | undefined>();
const showImage = computed(() => Boolean(props.src) && failed.value !== props.src);
const resolved = computed(() => avatarVariants({ size: props.size, shape: props.shape }));
const initials = computed(() => avatarInitials(props.name));
</script>

<template>
  <span
    :class="resolved.class"
    v-bind="resolved.attrs"
    :role="showImage ? undefined : 'img'"
    :aria-label="showImage ? undefined : name"
    :data-state="showImage ? 'image' : 'fallback'"
  >
    <img
      v-if="showImage"
      class="t-avatar__image"
      :src="src"
      :alt="alt ?? name ?? ''"
      @error="failed = src"
    />
    <span v-else class="t-avatar__fallback" aria-hidden="true">{{ initials }}</span>
  </span>
</template>
