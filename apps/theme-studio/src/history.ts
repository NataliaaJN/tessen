import { sameTheme } from '@tessen-ui/theme';
import type { Theme } from '@tessen-ui/theme';

export interface Entry {
  theme: Theme;
  label: string;
  at: number;
}

export interface History {
  entries: Entry[];
  cursor: number;
}

export const HISTORY_LIMIT = 100;
/** Edits with the same label closer than this (a slider drag) become one history step. */
export const COALESCE_MS = 800;

export function createHistory(theme: Theme, label = 'Inicio', now = Date.now()): History {
  return { entries: [{ theme, label, at: now }], cursor: 0 };
}

export const current = (h: History): Theme => (h.entries[h.cursor] as Entry).theme;
export const canUndo = (h: History): boolean => h.cursor > 0;
export const canRedo = (h: History): boolean => h.cursor < h.entries.length - 1;

/** Records `theme` as the new current state. Pure: returns a new history. */
export function commit(h: History, theme: Theme, label: string, now = Date.now()): History {
  const last = h.entries[h.cursor] as Entry;
  if (sameTheme(last.theme, theme)) return h;

  const atTip = h.cursor === h.entries.length - 1;
  if (atTip && h.cursor > 0 && last.label === label && now - last.at < COALESCE_MS) {
    const entries = h.entries.slice();
    entries[h.cursor] = { theme, label, at: now };
    return { entries, cursor: h.cursor };
  }

  let entries = [...h.entries.slice(0, h.cursor + 1), { theme, label, at: now }];
  if (entries.length > HISTORY_LIMIT) entries = entries.slice(entries.length - HISTORY_LIMIT);
  return { entries, cursor: entries.length - 1 };
}

export const undo = (h: History): History => (canUndo(h) ? { ...h, cursor: h.cursor - 1 } : h);
export const redo = (h: History): History => (canRedo(h) ? { ...h, cursor: h.cursor + 1 } : h);
export const jump = (h: History, index: number): History =>
  index >= 0 && index < h.entries.length ? { ...h, cursor: index } : h;
