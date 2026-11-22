<script setup lang="ts">
import { toCss } from '@tessen-ui/theme';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ApplyMessage } from '../preview/protocol';
import { previewTheme, studio } from '../state';

const frame = ref<HTMLIFrameElement | null>(null);
const ready = ref(false);
const src = `${import.meta.env.BASE_URL}preview.html`;

const widths = { fluid: '100%', tablet: '768px', mobile: '375px' } as const;
const width = computed(() => widths[studio.viewport]);

const message = computed<ApplyMessage>(() => ({
  type: 'tessen-studio:apply',
  css: toCss(previewTheme.value),
  mode: previewTheme.value.previewMode,
  motion: previewTheme.value.motion,
  scene: studio.scene,
}));

function send(): void {
  if (!ready.value) return;
  frame.value?.contentWindow?.postMessage(message.value, location.origin);
}

function onMessage(event: MessageEvent): void {
  if (event.origin !== location.origin || event.source !== frame.value?.contentWindow) return;
  if ((event.data as { type?: unknown } | null)?.type === 'tessen-studio:ready') {
    ready.value = true;
    send();
  }
}

onMounted(() => window.addEventListener('message', onMessage));
onBeforeUnmount(() => window.removeEventListener('message', onMessage));
watch(message, send);
</script>

<template>
  <div class="frame-wrap">
    <iframe
      ref="frame"
      class="frame"
      title="Vista previa del tema"
      :src="src"
      :style="{ inlineSize: width }"
    />
  </div>
</template>
