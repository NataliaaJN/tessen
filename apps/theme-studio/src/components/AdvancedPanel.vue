<script setup lang="ts">
import { createResolver, defaultTheme } from '@tessen-ui/theme';
import type { ThemeMode } from '@tessen-ui/theme';
import { TButton, TTab, TTabList, TTabPanel, TTabs } from '@tessen-ui/vue';
import { computed, ref } from 'vue';
import { primitiveColors, scaleNames, semanticColors, semanticGroup, tokenData } from '../data';
import { audit, edit, theme } from '../state';
import ColorField from './ColorField.vue';

const query = ref('');
const resolver = computed(() => createResolver(theme.value, tokenData));
const baseResolver = createResolver(defaultTheme(), tokenData);

const matches = (path: string): boolean => path.includes(query.value.trim().toLowerCase());

// ---- Primitives -----------------------------------------------------------------------------
const scales = computed(() =>
  scaleNames
    .map((name) => ({
      name,
      steps: primitiveColors.filter((t) => t.path.startsWith(`color.${name}.`) && matches(t.path)),
    }))
    .filter((s) => s.steps.length > 0),
);

function setPrimitive(path: string, hex: string): void {
  edit('Primitivo', (t) => {
    t.overrides.primitives[path] = hex;
  });
}
function clearPrimitive(path: string): void {
  edit('Primitivo', (t) => {
    delete t.overrides.primitives[path];
  });
}

// ---- Semantics ------------------------------------------------------------------------------
const aliasOptions = computed(() => [
  { label: 'Blanco / negro', paths: ['color.white', 'color.black'] },
  ...scaleNames.map((name) => ({
    label: name,
    paths: primitiveColors.filter((t) => t.path.startsWith(`color.${name}.`)).map((t) => t.path),
  })),
]);

const groups = computed(() => {
  const map = new Map<string, typeof semanticColors>();
  for (const t of semanticColors) {
    if (!matches(t.path)) continue;
    const g = semanticGroup(t.path);
    map.set(g, [...(map.get(g) ?? []), t]);
  }
  return [...map];
});

const warn = computed(() => {
  const set = new Set<string>();
  for (const f of audit.value.failures) {
    set.add(`${f.mode}:${f.foreground}`);
    set.add(`${f.mode}:${f.background}`);
  }
  return set;
});

const overrideOf = (path: string, mode: ThemeMode): string =>
  theme.value.overrides[mode][path] ?? '';
const selectValue = (path: string, mode: ThemeMode): string => {
  const o = overrideOf(path, mode);
  return o === '' ? '' : o.startsWith('{') ? o : 'custom';
};

function onAlias(path: string, mode: ThemeMode, value: string): void {
  edit('Semántico', (t) => {
    if (value === '') delete t.overrides[mode][path];
    else if (value === 'custom')
      t.overrides[mode][path] = resolver.value.color(path, mode) ?? '#000000';
    else t.overrides[mode][path] = value;
  });
}
function onCustom(path: string, mode: ThemeMode, hex: string): void {
  edit('Semántico', (t) => {
    t.overrides[mode][path] = hex;
  });
}

// ---- Differences vs the base theme -------------------------------------------------------------
const changes = computed(() => {
  const out: { path: string; mode: string; from: string; to: string }[] = [];
  for (const t of primitiveColors) {
    const to = resolver.value.color(t.path, 'light');
    const from = baseResolver.color(t.path, 'light');
    if (to && from && to !== from) out.push({ path: t.path, mode: 'primitivo', from, to });
  }
  for (const t of semanticColors) {
    for (const mode of ['light', 'dark'] as const) {
      const to = resolver.value.color(t.path, mode);
      const from = baseResolver.color(t.path, mode);
      if (to && from && to !== from)
        out.push({ path: t.path, mode: mode === 'light' ? 'claro' : 'oscuro', from, to });
    }
  }
  return out;
});

const overrideCount = computed(
  () =>
    Object.keys(theme.value.overrides.primitives).length +
    Object.keys(theme.value.overrides.light).length +
    Object.keys(theme.value.overrides.dark).length,
);

function clearAll(): void {
  edit('Quitar ajustes', (t) => {
    t.overrides = { primitives: {}, light: {}, dark: {} };
  });
}
</script>

<template>
  <div class="panel-body advanced">
    <label class="search">
      <span class="sr-only">Buscar token</span>
      <input
        v-model="query"
        type="search"
        placeholder="Buscar token (p. ej. action, text, brand)"
      />
    </label>
    <p class="hint">
      Los semánticos apuntan a primitivos por alias. Cambia un alias para moverlo por la escala o
      elige «Color propio». {{ overrideCount }} ajuste(s) manual(es).
      <TButton v-if="overrideCount > 0" size="sm" variant="ghost" @click="clearAll"
        >Quitar ajustes</TButton
      >
    </p>

    <TTabs default-value="semantic" variant="underline">
      <TTabList aria-label="Tipo de token">
        <TTab value="semantic">Semánticos</TTab>
        <TTab value="primitive">Primitivos</TTab>
        <TTab value="diff">Cambios ({{ changes.length }})</TTab>
      </TTabList>

      <TTabPanel value="semantic">
        <p v-if="groups.length === 0" class="hint">Ningún token coincide.</p>
        <section v-for="[group, tokens] in groups" :key="group" class="token-group">
          <h4>{{ group }}</h4>
          <div v-for="t in tokens" :key="t.path" class="token-row">
            <code class="token-name">
              {{ t.path.replace(`color.${group}.`, '') }}
            </code>
            <div
              v-for="mode in ['light', 'dark'] as const"
              :key="mode"
              class="cell"
              :data-mode="mode"
            >
              <span class="chip" :style="{ background: resolver.color(t.path, mode) }" />
              <select
                :aria-label="`${t.path}, modo ${mode === 'light' ? 'claro' : 'oscuro'}`"
                :value="selectValue(t.path, mode)"
                @change="(e) => onAlias(t.path, mode, (e.target as HTMLSelectElement).value)"
              >
                <option value="">
                  Por defecto ({{
                    tokenData.tokens
                      .find((x) => x.path === t.path)
                      ?.aliases?.[mode]?.replace('color.', '')
                  }})
                </option>
                <optgroup v-for="g in aliasOptions" :key="g.label" :label="g.label">
                  <option v-for="p in g.paths" :key="p" :value="`{${p}}`">
                    {{ p.replace('color.', '') }}
                  </option>
                </optgroup>
                <option value="custom">Color propio…</option>
              </select>
              <ColorField
                v-if="selectValue(t.path, mode) === 'custom'"
                :label="`${t.path} ${mode}`"
                :model-value="overrideOf(t.path, mode)"
                @update:model-value="(hex) => onCustom(t.path, mode, hex)"
              />
              <span
                v-if="warn.has(`${mode}:${t.path}`)"
                class="warn"
                role="img"
                aria-label="Contraste insuficiente"
                >⚠</span
              >
            </div>
          </div>
        </section>
      </TTabPanel>

      <TTabPanel value="primitive">
        <p v-if="scales.length === 0" class="hint">Ningún token coincide.</p>
        <section v-for="s in scales" :key="s.name" class="token-group">
          <h4>{{ s.name }}</h4>
          <div v-for="t in s.steps" :key="t.path" class="token-row token-row--prim">
            <code class="token-name">{{ t.path.split('.').pop() }}</code>
            <span class="cell">
              <ColorField
                :label="t.path"
                :model-value="resolver.color(t.path, 'light') ?? '#000000'"
                @update:model-value="(hex) => setPrimitive(t.path, hex)"
              />
              <TButton
                v-if="theme.overrides.primitives[t.path]"
                size="sm"
                variant="ghost"
                :aria-label="`Quitar ajuste de ${t.path}`"
                @click="clearPrimitive(t.path)"
                >Quitar</TButton
              >
            </span>
          </div>
        </section>
      </TTabPanel>

      <TTabPanel value="diff">
        <p v-if="changes.length === 0" class="hint">Este tema es idéntico a la base de Tessen.</p>
        <table v-else class="diff">
          <caption class="sr-only">
            Tokens que difieren de la base
          </caption>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Modo</th>
              <th scope="col">Base</th>
              <th scope="col">Tema</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in changes" :key="c.path + c.mode">
              <th scope="row">
                <code>{{ c.path.replace('color.', '') }}</code>
              </th>
              <td>{{ c.mode }}</td>
              <td><span class="chip" :style="{ background: c.from }" /> {{ c.from }}</td>
              <td><span class="chip" :style="{ background: c.to }" /> {{ c.to }}</td>
            </tr>
          </tbody>
        </table>
      </TTabPanel>
    </TTabs>
  </div>
</template>
