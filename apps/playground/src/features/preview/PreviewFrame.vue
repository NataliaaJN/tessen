<script setup lang="ts">
import type { Scene } from '@tessen-ui/core';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ForcedState, Framework, Width } from '../state/model.ts';
import type { AppearanceMessage, SceneMessage } from './protocol.ts';
import { isReadyMessage } from './protocol.ts';

const props = defineProps<{
  framework: Framework;
  scene: Scene;
  css: string;
  mode: 'light' | 'dark';
  force: ForcedState;
  width: Width;
}>();

const frame = ref<HTMLIFrameElement | null>(null);
const ready = ref(false);
const src = `${import.meta.env.BASE_URL}preview-${props.framework}.html`;
const label = props.framework === 'vue' ? 'Vue' : 'React';

const frameWidth = computed(() => (props.width === 'full' ? '100%' : `${props.width}px`));

const appearance = computed<AppearanceMessage>(() => ({
  type: 'tessen-playground:appearance',
  css: props.css,
  mode: props.mode,
  force: props.force,
}));

// A plain JSON copy: reactive proxies cannot be cloned by postMessage.
const sceneJson = computed(() => JSON.stringify(props.scene));

function post(message: AppearanceMessage | SceneMessage): void {
  frame.value?.contentWindow?.postMessage(message, location.origin);
}

function sendScene(): void {
  if (ready.value) post({ type: 'tessen-playground:scene', scene: JSON.parse(sceneJson.value) });
}

function onMessage(event: MessageEvent): void {
  if (event.origin !== location.origin || event.source !== frame.value?.contentWindow) return;
  if (isReadyMessage(event.data)) {
    ready.value = true;
    post(appearance.value);
    sendScene();
  }
}

onMounted(() => window.addEventListener('message', onMessage));
onBeforeUnmount(() => window.removeEventListener('message', onMessage));
// The scene remounts the preview, the appearance only restyles it.
watch(sceneJson, () => {
  sendScene();
  // The new DOM must get the theme and forced state again.
  if (ready.value) post(appearance.value);
});
watch(appearance, () => ready.value && post(appearance.value));
</script>

<template>
  <section class="pane" :aria-label="`Vista previa en ${label}`" :data-framework="framework">
    <header class="pane-title">
      <span class="pane-name">{{ label }}</span>
    </header>
    <div class="frame-wrap">
      <iframe
        ref="frame"
        class="frame"
        :title="`Vista previa en ${label}`"
        :src="src"
        :style="{ inlineSize: frameWidth }"
      />
    </div>
  </section>
</template>
