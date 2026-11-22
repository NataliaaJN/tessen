import { isHex, normalizeHex } from './scale.ts';

export type ThemeMode = 'light' | 'dark';
export type Density = 'compact' | 'default' | 'comfortable';
export type MotionMode = 'full' | 'reduced' | 'off';

/** Layers of the advanced editor: raw palette, then one overrides map per color mode. */
export interface ThemeOverrides {
  /** Primitive tokens, e.g. `color.neutral.500`. Values are hex colors. */
  primitives: Record<string, string>;
  /** Semantic tokens in light mode. Value: hex or alias `{color.brand.700}`. */
  light: Record<string, string>;
  /** Semantic tokens in dark mode. */
  dark: Record<string, string>;
}

/** The whole theme: a handful of controls plus optional advanced overrides. Plain JSON. */
export interface Theme {
  /** Schema version of this format. */
  version: 1;
  /** Slug used in file names and exported identifiers. */
  name: string;
  /** Seed of the accent scale; replaces `color.brand` and `color.accent`. */
  accent: string;
  /** `radius.base` in px; the whole radius scale derives from it. */
  radius: number;
  density: Density;
  motion: MotionMode;
  /** Font family names; the fallback stack is added on export. */
  fonts: { sans: string; display: string; mono: string };
  /** The mode the Studio previews; not exported to CSS. */
  previewMode: ThemeMode;
  overrides: ThemeOverrides;
}

export const DEFAULT_FONTS = { sans: 'Inter', display: 'Outfit', mono: 'JetBrains Mono' } as const;
/** Fallback stacks, identical to the tokens package. */
export const FONT_FALLBACKS = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  display: 'Inter, ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;

export const BASE_ACCENT = '#2B7BE0';

export function emptyOverrides(): ThemeOverrides {
  return { primitives: {}, light: {}, dark: {} };
}

export function defaultTheme(): Theme {
  return {
    version: 1,
    name: 'tessen',
    accent: BASE_ACCENT,
    radius: 6,
    density: 'default',
    motion: 'full',
    fonts: { ...DEFAULT_FONTS },
    previewMode: 'light',
    overrides: emptyOverrides(),
  };
}

const NAME = /^[a-z0-9][a-z0-9-]{0,39}$/;
const TOKEN_PATH = /^[a-z0-9]+(\.[a-z0-9-]+)+$/;
const ALIAS = /^\{[a-z0-9]+(\.[a-z0-9-]+)+\}$/;
const FONT = /^[\p{L}\p{N} _.-]{1,60}$/u;

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return NAME.test(s) ? s : 'mi-tema';
}

export class ThemeError extends Error {
  readonly issues: string[];
  constructor(issues: string[]) {
    super(`Tema inválido: ${issues.join('; ')}`);
    this.name = 'ThemeError';
    this.issues = issues;
  }
}

function cleanMap(
  raw: unknown,
  where: string,
  allowAlias: boolean,
  issues: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  if (raw === undefined) return out;
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    issues.push(`${where} debe ser un objeto`);
    return out;
  }
  for (const [path, value] of Object.entries(raw)) {
    if (!TOKEN_PATH.test(path)) issues.push(`${where}: ruta de token inválida «${path}»`);
    else if (typeof value === 'string' && isHex(value)) out[path] = normalizeHex(value);
    else if (allowAlias && typeof value === 'string' && ALIAS.test(value)) out[path] = value;
    else {
      const expected = allowAlias ? 'un color hex o un alias {ruta}' : 'un color hex';
      issues.push(`${where}.${path}: valor inválido (se espera ${expected})`);
    }
  }
  return out;
}

function pick<T>(
  raw: unknown,
  fallback: T,
  ok: (v: unknown) => v is T,
  message: string,
  issues: string[],
): T {
  if (raw === undefined) return fallback;
  if (ok(raw)) return raw;
  issues.push(message);
  return fallback;
}

/**
 * Validates untrusted input (imported file, URL, localStorage) and returns a clean `Theme`.
 * Unknown keys are dropped; missing keys take the default. Throws `ThemeError` listing every issue.
 */
export function parseTheme(input: unknown): Theme {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new ThemeError(['el tema debe ser un objeto JSON']);
  }
  const issues: string[] = [];
  const base = defaultTheme();
  const r = input as Record<string, unknown>;
  if (r.version !== undefined && r.version !== 1) {
    issues.push(`versión no soportada: ${String(r.version)}`);
  }

  const name = pick(
    r.name,
    base.name,
    (v): v is string => typeof v === 'string' && NAME.test(v),
    'name debe ser un slug (a-z, 0-9, guiones)',
    issues,
  );
  const accentRaw = pick(
    r.accent,
    base.accent,
    (v): v is string => typeof v === 'string' && isHex(v),
    'accent debe ser un color hex',
    issues,
  );
  const radius = pick(
    r.radius,
    base.radius,
    (v): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 24,
    'radius debe ser un número entre 0 y 24',
    issues,
  );
  const density = pick(
    r.density,
    base.density,
    (v): v is Density => v === 'compact' || v === 'default' || v === 'comfortable',
    'density debe ser compact, default o comfortable',
    issues,
  );
  const motion = pick(
    r.motion,
    base.motion,
    (v): v is MotionMode => v === 'full' || v === 'reduced' || v === 'off',
    'motion debe ser full, reduced u off',
    issues,
  );
  const previewMode = pick(
    r.previewMode,
    base.previewMode,
    (v): v is ThemeMode => v === 'light' || v === 'dark',
    'previewMode debe ser light o dark',
    issues,
  );

  const fonts = { ...base.fonts };
  if (r.fonts !== undefined) {
    if (typeof r.fonts !== 'object' || r.fonts === null) issues.push('fonts debe ser un objeto');
    else {
      for (const k of ['sans', 'display', 'mono'] as const) {
        const v = (r.fonts as Record<string, unknown>)[k];
        if (v === undefined) continue;
        if (typeof v === 'string' && FONT.test(v)) fonts[k] = v.trim();
        else issues.push(`fonts.${k}: nombre de fuente inválido`);
      }
    }
  }

  const o = (typeof r.overrides === 'object' && r.overrides !== null ? r.overrides : {}) as Record<
    string,
    unknown
  >;
  const overrides: ThemeOverrides = {
    primitives: cleanMap(o.primitives, 'overrides.primitives', false, issues),
    light: cleanMap(o.light, 'overrides.light', true, issues),
    dark: cleanMap(o.dark, 'overrides.dark', true, issues),
  };

  if (issues.length > 0) throw new ThemeError(issues);
  return {
    version: 1,
    name,
    accent: normalizeHex(accentRaw),
    radius: Math.round(radius * 10) / 10,
    density,
    motion,
    fonts,
    previewMode,
    overrides,
  };
}

/** `true` when two themes are equal field by field (undo/redo and "modified" badges). */
export function sameTheme(a: Theme, b: Theme): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
