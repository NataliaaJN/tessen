<script setup lang="ts">
import { renderScene } from '@tessen-ui/core';
import { PRESETS, toCss } from '@tessen-ui/theme';
import { TButton, TNativeSelect } from '@tessen-ui/vue';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import CodePanel from './features/code/CodePanel.vue';
import ControlsPanel from './features/controls/ControlsPanel.vue';
import PreviewFrame from './features/preview/PreviewFrame.vue';
import { recipeBySlug, recipes } from './features/recipes/index.ts';
import type { ControlValue } from './features/recipes/index.ts';
import { FORCED_STATES, WIDTHS, initialState } from './features/state/model.ts';
import type { ForcedState, FrameworkView, Width } from './features/state/model.ts';
import { decodeState, encodeState } from './features/state/url.ts';

const base = import.meta.env.BASE_URL;
const state = reactive(decodeState(location.hash));
// A fresh visit previews in the same light or dark mode as the app around it.
if (!location.hash.includes('s=') && document.documentElement.dataset.tessenTheme === 'dark') {
  state.mode = 'dark';
}
const recipe = computed(() => recipeBySlug(state.slug) ?? recipes[0]!);
const scene = computed(() => recipe.value.build(state.values));
const vueCode = computed(() => renderScene(scene.value, 'vue'));
const reactCode = computed(() => renderScene(scene.value, 'react'));

const code = computed(() => (state.code === 'vue' ? vueCode.value : reactCode.value));
const fileName = computed(() =>
  state.code === 'vue' ? `${recipe.value.name}Example.vue` : `${recipe.value.name}Example.tsx`,
);

const css = computed(() => {
  const preset = PRESETS.find((p) => p.id === state.theme);
  return preset ? toCss(preset.theme) : '';
});

// Components grouped by category for the selector.
const groups = computed(() => {
  const byCategory = new Map<string, typeof recipes>();
  for (const r of recipes) byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), r]);
  return [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]));
});

const categoryNames: Record<string, string> = {
  actions: 'Acciones',
  feedback: 'Retroalimentación',
  forms: 'Formularios',
  overlays: 'Superposiciones',
  navigation: 'Navegación',
  'data-display': 'Datos',
  layout: 'Maquetación',
  disclosure: 'Divulgación',
  utilities: 'Utilidades',
};
const categoryLabel = (c: string): string => categoryNames[c] ?? c;

const forcedLabels: Record<ForcedState, string> = {
  none: 'Normal',
  hover: 'Hover',
  focus: 'Foco',
  pressed: 'Pulsado',
};
const widthLabels: Record<Width, string> = {
  full: 'Libre',
  '320': '320',
  '768': '768',
  '1024': '1024',
};
const viewLabels: [FrameworkView, string][] = [
  ['both', 'Vue y React'],
  ['vue', 'Vue'],
  ['react', 'React'],
];

function selectComponent(slug: string): void {
  if (slug === state.slug) return;
  const next = initialState(slug);
  Object.assign(state, {
    slug: next.slug,
    values: next.values,
    force: 'none',
  });
}

const change = (name: string, value: ControlValue): void => {
  state.values = { ...state.values, [name]: value };
};
const reset = (): void => {
  state.values = { ...recipe.value.initial };
  state.force = 'none';
};

function selectTheme(id: string): void {
  state.theme = id;
  const preset = PRESETS.find((p) => p.id === id);
  if (preset) state.mode = preset.theme.previewMode;
}

// ── URL ──────────────────────────────────────────────────────────────────────
const copiedLink = ref(false);
let linkTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  state,
  () => {
    const hash = `#${encodeState(state)}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  },
  { deep: true, immediate: true },
);

function onHashChange(): void {
  const next = decodeState(location.hash);
  if (encodeState(next) !== encodeState(state)) Object.assign(state, next);
}

async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(location.href);
    copiedLink.value = true;
    clearTimeout(linkTimer);
    linkTimer = setTimeout(() => (copiedLink.value = false), 1500);
  } catch {
    // Clipboard blocked: the address bar already holds the link.
  }
}

onMounted(() => window.addEventListener('hashchange', onHashChange));
onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange));

const shown = computed(() =>
  state.view === 'both' ? (['vue', 'react'] as const) : ([state.view] as const),
);
</script>

<template>
  <div class="app">
    <a class="skip" href="#main">Saltar al contenido</a>
    <header class="bar">
      <a class="brand" href="/" aria-label="Tessen, inicio">
        <img
          class="mark mark-light"
          :src="`${base}tessen-mark.svg`"
          alt=""
          width="32"
          height="32"
        />
        <img
          class="mark mark-dark"
          :src="`${base}tessen-mark-on-dark.svg`"
          alt=""
          width="32"
          height="32"
        />
        tessen <span>playground</span>
      </a>
      <div class="bar-field">
        <label for="component" class="sr-only">Componente</label>
        <TNativeSelect
          id="component"
          :model-value="state.slug"
          data-testid="component"
          @update:model-value="(v: string) => selectComponent(v)"
        >
          <optgroup
            v-for="[category, list] in groups"
            :key="category"
            :label="categoryLabel(category)"
          >
            <option v-for="r in list" :key="r.slug" :value="r.slug">{{ r.name }}</option>
          </optgroup>
        </TNativeSelect>
      </div>
      <span class="spacer" />
      <nav class="bar-links" aria-label="Plataforma">
        <a :href="`/components/${recipe.slug}/`">Documentación</a>
        <a href="/studio/">Theme Studio</a>
      </nav>
      <TButton size="sm" variant="outline" data-testid="copy-link" @click="copyLink">
        {{ copiedLink ? 'Enlace copiado' : 'Copiar enlace' }}
      </TButton>
    </header>

    <aside class="side" aria-label="Opciones">
      <ControlsPanel :recipe="recipe" :values="state.values" @change="change" @reset="reset" />

      <section class="panel" aria-label="Estado forzado">
        <h2>Estado</h2>
        <div class="segments" role="group" aria-label="Estado forzado">
          <button
            v-for="f in FORCED_STATES"
            :key="f"
            type="button"
            class="seg"
            :aria-pressed="state.force === f"
            :data-testid="`force-${f}`"
            @click="state.force = f"
          >
            {{ forcedLabels[f] }}
          </button>
        </div>
        <p class="hint">Fuerza hover, foco o pulsado en la vista previa sin mover el ratón.</p>
      </section>

      <section class="panel" aria-label="Tema">
        <h2>Tema</h2>
        <label for="theme" class="control-label">Preset</label>
        <TNativeSelect
          id="theme"
          size="sm"
          :model-value="state.theme"
          data-testid="theme"
          @update:model-value="(v: string) => selectTheme(v)"
        >
          <option value="base">Base (Cobalto)</option>
          <option v-for="p in PRESETS.filter((x) => x.id !== 'cobalto')" :key="p.id" :value="p.id">
            {{ p.label }}
          </option>
        </TNativeSelect>
        <div class="segments" role="group" aria-label="Modo de color">
          <button
            type="button"
            class="seg"
            :aria-pressed="state.mode === 'light'"
            data-testid="mode-light"
            @click="state.mode = 'light'"
          >
            Claro
          </button>
          <button
            type="button"
            class="seg"
            :aria-pressed="state.mode === 'dark'"
            data-testid="mode-dark"
            @click="state.mode = 'dark'"
          >
            Oscuro
          </button>
        </div>
        <p class="hint">
          ¿Tu propio tema? Créalo en el <a href="/studio/">Theme Studio</a> y expórtalo.
        </p>
      </section>
    </aside>

    <main id="main" class="main">
      <div class="toolbar">
        <div class="segments" role="group" aria-label="Frameworks mostrados">
          <button
            v-for="[id, label] in viewLabels"
            :key="id"
            type="button"
            class="seg"
            :aria-pressed="state.view === id"
            :data-testid="`view-${id}`"
            @click="
              state.view = id;
              if (id !== 'both') state.code = id;
            "
          >
            {{ label }}
          </button>
        </div>
        <div class="segments" role="group" aria-label="Ancho de la vista previa">
          <button
            v-for="w in WIDTHS"
            :key="w"
            type="button"
            class="seg"
            :aria-pressed="state.width === w"
            :data-testid="`width-${w}`"
            @click="state.width = w"
          >
            {{ widthLabels[w] }}
          </button>
        </div>
      </div>

      <div class="previews" :data-count="shown.length">
        <PreviewFrame
          v-for="fw in shown"
          :key="fw"
          :framework="fw"
          :scene="scene"
          :css="css"
          :mode="state.mode"
          :force="state.force"
          :width="state.width"
        />
      </div>

      <CodePanel v-model:framework="state.code" :code="code" :file-name="fileName" />
    </main>
  </div>
</template>
