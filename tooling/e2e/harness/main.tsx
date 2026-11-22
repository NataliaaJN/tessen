import '@tessen-ui/styles';
import * as tessenVue from '@tessen-ui/vue';
import { createApp } from 'vue';
import { createRoot } from 'react-dom/client';
import { sceneNames, type SceneName } from './scene-names.ts';
import { scenes } from './scenes.tsx';

/** `?scene=<name>&fw=vue|react&theme=light|dark` renders one scene in one framework. */
const params = new URLSearchParams(location.search);
const name = params.get('scene') as SceneName;
const framework = params.get('fw');
const root = document.getElementById('root')!;
document.documentElement.setAttribute('data-tessen-theme', params.get('theme') ?? 'light');

if (!sceneNames.includes(name)) throw new Error(`unknown scene ${String(name)}`);

if (framework === 'vue') {
  const app = createApp({ template: scenes[name].vue, setup: scenes[name].vueSetup });
  for (const [key, component] of Object.entries(tessenVue)) {
    if (/^T[A-Z]/.test(key)) app.component(key, component as never);
  }
  app.mount(root);
} else {
  createRoot(root).render(scenes[name].react());
}
requestAnimationFrame(() => requestAnimationFrame(() => (root.dataset.ready = 'true')));
