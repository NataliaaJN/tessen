<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import ComponentsScene from './scenes/ComponentsScene.vue';
import DashboardScene from './scenes/DashboardScene.vue';
import FormsScene from './scenes/FormsScene.vue';
import LandingScene from './scenes/LandingScene.vue';
import TypographyScene from './scenes/TypographyScene.vue';
import { isApplyMessage } from './protocol';
import type { PreviewScene } from './protocol';

const scene = ref<PreviewScene>('components');

function onMessage(event: MessageEvent): void {
  // Only the Studio that embeds this page may drive it.
  if (event.origin !== location.origin || event.source !== window.parent) return;
  if (!isApplyMessage(event.data)) return;
  const { css, mode, motion, scene: next } = event.data;
  const style = document.getElementById('studio-theme');
  if (style) style.textContent = css;
  const root = document.documentElement;
  root.dataset.tessenTheme = mode;
  if (motion === 'full') delete root.dataset.tessenMotion;
  else root.dataset.tessenMotion = motion;
  scene.value = next;
}

onMounted(() => {
  window.addEventListener('message', onMessage);
  window.parent.postMessage({ type: 'tessen-studio:ready' }, location.origin);
});
onBeforeUnmount(() => window.removeEventListener('message', onMessage));
</script>

<template>
  <main class="stage" :data-scene="scene">
    <ComponentsScene v-if="scene === 'components'" />
    <FormsScene v-else-if="scene === 'forms'" />
    <DashboardScene v-else-if="scene === 'dashboard'" />
    <LandingScene v-else-if="scene === 'landing'" />
    <TypographyScene v-else />
  </main>
</template>
