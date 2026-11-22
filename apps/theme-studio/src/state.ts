import {
  PRESETS,
  ThemeError,
  auditTheme,
  decodeTheme,
  defaultTheme,
  encodeTheme,
  importTheme,
  parseTheme,
  slugify,
} from '@tessen-ui/theme';
import type { Theme } from '@tessen-ui/theme';
import { computed, reactive, watch } from 'vue';
import { contrastPairs, tokenData } from './data';
import * as H from './history';
import { loadDraft, loadSaved, newId, persistDraft, persistSaved } from './storage';
import type { SavedTheme } from './storage';

export type Scene = 'components' | 'forms' | 'dashboard' | 'landing' | 'typography';
export type Viewport = 'fluid' | 'tablet' | 'mobile';
export type Panel = 'quick' | 'advanced';

export interface Notice {
  kind: 'info' | 'error' | 'success';
  text: string;
}

/** Deep copy that also works on Vue reactive proxies (structuredClone does not). */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function fromUrl(): Theme | null {
  const code = new URLSearchParams(location.hash.slice(1)).get('t');
  if (!code) return null;
  try {
    return decodeTheme(code);
  } catch {
    return null;
  }
}

const shared = fromUrl();
const initial = shared ?? loadDraft() ?? defaultTheme();

export const studio = reactive({
  history: H.createHistory(initial, shared ? 'Tema compartido' : 'Inicio'),
  saved: loadSaved() as SavedTheme[],
  panel: 'quick' as Panel,
  scene: 'components' as Scene,
  viewport: 'fluid' as Viewport,
  /** Show the base theme instead of the edited one (THS-07). */
  compare: false,
  notice: (shared
    ? {
        kind: 'info',
        text: 'Se cargó el tema de un enlace compartido. Guárdalo si quieres conservarlo.',
      }
    : null) as Notice | null,
  exportOpen: false,
});

export const theme = computed(() => H.current(studio.history));
export const canUndo = computed(() => H.canUndo(studio.history));
export const canRedo = computed(() => H.canRedo(studio.history));

/** What the preview shows: the edited theme or, when comparing, the base theme in the same mode. */
export const previewTheme = computed<Theme>(() =>
  studio.compare ? { ...defaultTheme(), previewMode: theme.value.previewMode } : theme.value,
);

export const audit = computed(() => auditTheme(theme.value, tokenData, contrastPairs));

export function say(kind: Notice['kind'], text: string): void {
  studio.notice = { kind, text };
}

/** Applies a change to the current theme and records it. `label` groups slider drags together. */
export function edit(label: string, change: (draft: Theme) => void): void {
  const draft = clone(theme.value);
  change(draft);
  studio.history = H.commit(studio.history, draft, label);
}

export const undo = (): void => {
  studio.history = H.undo(studio.history);
};
export const redo = (): void => {
  studio.history = H.redo(studio.history);
};
export const jumpTo = (index: number): void => {
  studio.history = H.jump(studio.history, index);
};

export function reset(): void {
  studio.history = H.commit(studio.history, defaultTheme(), 'Restablecer');
}

export function applyPreset(id: string): void {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return;
  studio.history = H.commit(studio.history, clone(preset.theme), `Preset ${preset.label}`);
}

/** Replaces the whole theme (import, saved theme, share link). */
export function replaceTheme(next: Theme, label: string): void {
  studio.history = H.commit(studio.history, next, label);
}

// ---- Saved themes (localStorage) --------------------------------------------------------------

export function saveCurrent(title: string): void {
  const clean = title.trim().slice(0, 60) || theme.value.name;
  const existing = studio.saved.find((s) => s.title === clean);
  const entry: SavedTheme = {
    id: existing?.id ?? newId(),
    title: clean,
    updatedAt: Date.now(),
    theme: clone(theme.value),
  };
  studio.saved = [entry, ...studio.saved.filter((s) => s.id !== entry.id)];
  const ok = persistSaved(studio.saved);
  say(
    ok ? 'success' : 'error',
    ok
      ? `«${clean}» guardado en este navegador.`
      : 'No se pudo guardar: el navegador bloquea el almacenamiento.',
  );
}

export function loadSavedTheme(id: string): void {
  const found = studio.saved.find((s) => s.id === id);
  if (found) replaceTheme(clone(found.theme), `Abrir ${found.title}`);
}

export function removeSavedTheme(id: string): void {
  studio.saved = studio.saved.filter((s) => s.id !== id);
  persistSaved(studio.saved);
}

// ---- Import / share -------------------------------------------------------------------------

export function importText(text: string, fileName: string): boolean {
  try {
    replaceTheme(importTheme(text, fileName), `Importar ${fileName}`);
    say('success', `Tema importado desde ${fileName}.`);
    return true;
  } catch (e) {
    say('error', e instanceof ThemeError ? e.message : 'No se pudo leer el archivo.');
    return false;
  }
}

export function shareUrl(): string {
  const url = new URL(location.href);
  url.hash = `t=${encodeTheme(theme.value)}`;
  return url.toString();
}

export const fileSlug = (): string => slugify(theme.value.name);

// ---- Persistence ----------------------------------------------------------------------------

let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  theme,
  (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      persistDraft(value);
      try {
        const url = new URL(location.href);
        const isBase = JSON.stringify(value) === JSON.stringify(defaultTheme());
        url.hash = isBase ? '' : `t=${encodeTheme(value)}`;
        history.replaceState(null, '', url);
      } catch {
        // History can be blocked in sandboxed frames; the draft is still saved.
      }
    }, 250);
  },
  { deep: false },
);

export { parseTheme };
