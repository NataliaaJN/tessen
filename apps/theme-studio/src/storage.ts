import { parseTheme } from '@tessen-ui/theme';
import type { Theme } from '@tessen-ui/theme';

export const THEMES_KEY = 'tessen:studio:themes';
export const DRAFT_KEY = 'tessen:studio:draft';
const SCHEMA = 1;
const MAX_SAVED = 50;

export interface SavedTheme {
  id: string;
  /** Display name (free text); the theme's own `name` is the export slug. */
  title: string;
  updatedAt: number;
  theme: Theme;
}

/** Storage can be missing or blocked (private windows, embedded previews): fail quietly. */
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function loadSaved(): SavedTheme[] {
  const raw = read(THEMES_KEY);
  if (!raw) return [];
  try {
    const doc = JSON.parse(raw) as { schema?: number; items?: unknown };
    if (doc.schema !== SCHEMA || !Array.isArray(doc.items)) return [];
    const out: SavedTheme[] = [];
    for (const item of doc.items as Record<string, unknown>[]) {
      try {
        out.push({
          id: String(item.id),
          title: String(item.title ?? 'Sin título').slice(0, 60),
          updatedAt: Number(item.updatedAt) || 0,
          theme: parseTheme(item.theme),
        });
      } catch {
        // A damaged entry must not hide the others.
      }
    }
    return out;
  } catch {
    return [];
  }
}

export function persistSaved(items: SavedTheme[]): boolean {
  return write(THEMES_KEY, JSON.stringify({ schema: SCHEMA, items: items.slice(0, MAX_SAVED) }));
}

export function loadDraft(): Theme | null {
  const raw = read(DRAFT_KEY);
  if (!raw) return null;
  try {
    return parseTheme(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistDraft(theme: Theme): void {
  write(DRAFT_KEY, JSON.stringify(theme));
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
