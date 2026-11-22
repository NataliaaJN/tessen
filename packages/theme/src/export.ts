import { hexToRgb } from './color.ts';
import { DEFAULT_FONTS, FONT_FALLBACKS, defaultTheme } from './model.ts';
import type { Theme, ThemeMode } from './model.ts';
import { cssVariable, themePrimitives } from './resolve.ts';

const DENSITY_SCALE = { compact: 0.875, default: 1, comfortable: 1.125 } as const;
const DURATIONS = ['fast', 'normal', 'slow', 'slower'] as const;

export type Declaration = readonly [name: string, value: string];

function fontStack(kind: keyof Theme['fonts'], name: string): string {
  return `"${name}", ${FONT_FALLBACKS[kind]}`;
}

function aliasToVar(value: string): string {
  const alias = /^\{(.+)\}$/.exec(value)?.[1];
  return alias ? `var(${cssVariable(alias)})` : value;
}

const byPath = (a: readonly [string, string], b: readonly [string, string]): number =>
  a[0].localeCompare(b[0], 'en', { numeric: true });

/** Declarations that do not depend on the color mode. Empty for the base theme. */
export function baseDeclarations(theme: Theme): Declaration[] {
  const out: Declaration[] = [];
  const prims = Object.entries(themePrimitives(theme)).sort(byPath);
  for (const [path, hex] of prims) out.push([cssVariable(path), hex]);
  if (theme.radius !== defaultTheme().radius)
    out.push(['--tessen-radius-base', `${theme.radius}px`]);
  if (theme.density !== 'default') {
    out.push(['--tessen-density-scale', String(DENSITY_SCALE[theme.density])]);
  }
  for (const kind of ['sans', 'display', 'mono'] as const) {
    if (theme.fonts[kind] !== DEFAULT_FONTS[kind]) {
      out.push([`--tessen-font-family-${kind}`, fontStack(kind, theme.fonts[kind])]);
    }
  }
  if (theme.motion === 'off') {
    for (const d of DURATIONS) out.push([`--tessen-motion-duration-${d}`, '0ms']);
  }
  return out;
}

/** Semantic overrides of one mode, as declarations. */
export function modeDeclarations(theme: Theme, mode: ThemeMode): Declaration[] {
  return Object.entries(theme.overrides[mode])
    .sort(byPath)
    .map(([path, value]) => [cssVariable(path), aliasToVar(value)] as const);
}

const block = (selector: string, decls: readonly Declaration[], indent = ''): string =>
  `${indent}${selector} {\n${decls.map(([n, v]) => `${indent}  ${n}: ${v};`).join('\n')}\n${indent}}`;

export interface CssOptions {
  /** Where the variables apply. Default `:root`. */
  selector?: string;
}

/**
 * Minimal CSS that makes an app look like the theme: only what differs from the base tokens.
 * It is unlayered on purpose, so it beats `@layer tessen.tokens` wherever it is imported.
 */
export function toCss(theme: Theme, options: CssOptions = {}): string {
  const sel = options.selector ?? ':root';
  const parts: string[] = [
    `/* Tema Tessen «${theme.name}». Generado por Theme Studio; solo contiene lo que cambia respecto a la base. */`,
  ];
  const base = baseDeclarations(theme);
  if (base.length > 0) parts.push(block(sel, base));

  const light = modeDeclarations(theme, 'light');
  const dark = modeDeclarations(theme, 'dark');
  if (light.length > 0) {
    parts.push(block(`${sel}[data-tessen-theme='light']`, light));
    parts.push(
      `@media (prefers-color-scheme: light) {\n${block(`${sel}:not([data-tessen-theme])`, light, '  ')}\n}`,
    );
  }
  if (dark.length > 0) {
    parts.push(block(`${sel}[data-tessen-theme='dark']`, dark));
    parts.push(
      `@media (prefers-color-scheme: dark) {\n${block(`${sel}:not([data-tessen-theme])`, dark, '  ')}\n}`,
    );
  }
  if (theme.motion === 'reduced') {
    parts.push(`/* Movimiento reducido: añade data-tessen-motion="reduced" al elemento <html>. */`);
  }
  if (parts.length === 1) parts.push('/* Sin diferencias con el tema base. */');
  return `${parts.join('\n\n')}\n`;
}

// ---------------------------------------------------------------------------
// DTCG
// ---------------------------------------------------------------------------

function dtcgColor(hex: string): Record<string, unknown> {
  const rgb = hexToRgb(hex);
  return {
    colorSpace: 'srgb',
    components: rgb.map((v) => Number((Math.round(v * 255) / 255).toFixed(6))),
    hex: hex.toUpperCase(),
  };
}

function setPath(root: Record<string, unknown>, path: string, leaf: unknown): void {
  const keys = path.split('.');
  let node = root;
  for (const key of keys.slice(0, -1)) {
    node = (node[key] ??= {}) as Record<string, unknown>;
  }
  node[keys[keys.length - 1] as string] = leaf;
}

/**
 * DTCG 2025.10 document with the tokens the theme changes. The whole theme travels in
 * `$extensions.tessen.theme`, so importing the file again gives back exactly the same theme.
 */
export function toDtcg(theme: Theme): Record<string, unknown> {
  const doc: Record<string, unknown> = {
    $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
    $description: `Tema Tessen «${theme.name}». Generado por Theme Studio.`,
  };
  for (const [path, hex] of Object.entries(themePrimitives(theme)).sort(byPath)) {
    setPath(doc, path, { $type: 'color', $value: dtcgColor(hex) });
  }
  setPath(doc, 'radius.base', { $type: 'dimension', $value: { value: theme.radius, unit: 'px' } });
  setPath(doc, 'density.scale', { $type: 'number', $value: DENSITY_SCALE[theme.density] });
  for (const kind of ['sans', 'display', 'mono'] as const) {
    setPath(doc, `font.family.${kind}`, {
      $type: 'fontFamily',
      $value: [
        theme.fonts[kind],
        ...FONT_FALLBACKS[kind].split(',').map((s) => s.trim().replace(/^"|"$/g, '')),
      ],
    });
  }
  const modes: Record<string, Record<string, unknown>> = { light: {}, dark: {} };
  for (const mode of ['light', 'dark'] as const) {
    for (const [path, value] of Object.entries(theme.overrides[mode]).sort(byPath)) {
      setPath(modes[mode] as Record<string, unknown>, path, {
        $type: 'color',
        $value: value.startsWith('{') ? value : dtcgColor(value),
      });
    }
  }
  doc.$extensions = { tessen: { theme, modes } };
  return doc;
}

// ---------------------------------------------------------------------------
// Tailwind v4
// ---------------------------------------------------------------------------

const TAILWIND_ROLES: [utility: string, token: string][] = [
  ['background', 'color.surface.default'],
  ['canvas', 'color.surface.canvas'],
  ['foreground', 'color.text.primary'],
  ['muted-foreground', 'color.text.secondary'],
  ['border', 'color.border.default'],
  ['primary', 'color.action.primary.default'],
  ['primary-foreground', 'color.action.primary.on'],
  ['danger', 'color.action.danger.default'],
  ['ring', 'color.focus.ring'],
];

/**
 * Tailwind v4 CSS: the theme overrides plus an `@theme inline` block that exposes Tessen's
 * tokens as utilities (`bg-primary`, `text-foreground`, `rounded-md`, `font-sans`...).
 * `inline` keeps the utilities pointing at the live variables, so light/dark keep working.
 */
export function toTailwind(theme: Theme): string {
  const lines: string[] = [];
  for (const scale of ['brand', 'accent']) {
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      lines.push(`  --color-${scale}-${step}: var(--tessen-color-${scale}-${step});`);
    }
  }
  for (const [name, token] of TAILWIND_ROLES)
    lines.push(`  --color-${name}: var(${cssVariable(token)});`);
  for (const r of ['xs', 'sm', 'md', 'lg', 'xl', '2xl'])
    lines.push(`  --radius-${r}: var(--tessen-radius-${r});`);
  for (const f of ['sans', 'mono']) lines.push(`  --font-${f}: var(--tessen-font-family-${f});`);
  lines.push('  --font-display: var(--tessen-font-family-display);');
  return `${toCss(theme)}\n/* Utilidades de Tailwind v4 sobre los tokens de Tessen. Importa antes @tessen-ui/styles/index.css. */\n@theme inline {\n${lines.join('\n')}\n}\n`;
}

// ---------------------------------------------------------------------------
// TypeScript
// ---------------------------------------------------------------------------

const toIdentifier = (name: string): string =>
  name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase()).replace(/^[0-9]/, '_$&');

/** A typed module: the theme as data, its CSS variables, and `applyTheme()` for runtime use. */
export function toTypeScript(theme: Theme): string {
  const id = toIdentifier(theme.name);
  const vars = [...baseDeclarations(theme)];
  const entries = vars.map(([n, v]) => `  ${JSON.stringify(n)}: ${JSON.stringify(v)},`).join('\n');
  const modeVars = (mode: ThemeMode): string =>
    modeDeclarations(theme, mode)
      .map(([n, v]) => `    ${JSON.stringify(n)}: ${JSON.stringify(v)},`)
      .join('\n');
  return `// Tema Tessen «${theme.name}». Generado por Theme Studio.

/** Variables que no dependen del modo de color. */
export const ${id}Variables = {
${entries}
} as const;

/** Variables semánticas por modo de color. */
export const ${id}ModeVariables = {
  light: {
${modeVars('light')}
  },
  dark: {
${modeVars('dark')}
  },
} as const;

/** Aplica el tema a un elemento (por defecto <html>). Devuelve una función para deshacerlo. */
export function apply${id.charAt(0).toUpperCase()}${id.slice(1)}Theme(
  element: HTMLElement = document.documentElement,
): () => void {
  const mode = element.getAttribute('data-tessen-theme') === 'dark' ? 'dark' : 'light';
  const all: Record<string, string> = { ...${id}Variables, ...${id}ModeVariables[mode] };
  for (const [name, value] of Object.entries(all)) element.style.setProperty(name, value);
  return () => {
    for (const name of Object.keys(all)) element.style.removeProperty(name);
  };
}
`;
}

/** The native, re-importable format: the theme as pretty JSON. */
export function toThemeJson(theme: Theme): string {
  return `${JSON.stringify(theme, null, 2)}\n`;
}
