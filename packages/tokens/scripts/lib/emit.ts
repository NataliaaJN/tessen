/**
 * Output generation: CSS custom properties, TypeScript and JSON.
 *
 * Style Dictionary resolves the tokens (see source.ts); the files are
 * assembled here because one stylesheet must combine light, dark and density
 * modes, and a Style Dictionary format only ever sees a single dictionary.
 */
import { DENSITIES, THEMES, REFERENCE } from './source.ts';
import type { Density, Theme } from './source.ts';
import type { Model, ModelToken } from './model.ts';

export const CSS_PREFIX = 'tessen';
/** Token groups that do not become CSS variables (they cannot be used inside `@media`). */
const CSS_EXCLUDED_ROOTS = new Set(['breakpoint']);
const REM_BASE = 16;

/** `lineHeight` -> `line-height`. */
const kebab = (segment: string): string =>
  segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export const cssVarName = (path: readonly string[]): string =>
  `--${[CSS_PREFIX, ...path.map(kebab)].join('-')}`;

const num = (value: number): string => String(Number(value.toFixed(4)));

type Dim = { value: number; unit: string };
const isDim = (value: unknown): value is Dim =>
  typeof value === 'object' && value !== null && 'value' in value && 'unit' in value;

function refToVar(ref: string): string {
  return `var(${cssVarName(ref.split('.'))})`;
}

/** Returns `var(--x)` when `value` is an alias, otherwise `undefined`. */
function asVar(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = REFERENCE.exec(value);
  return match ? refToVar(match[1] as string) : undefined;
}

function colorCss(value: unknown): string {
  const color = value as { components: number[]; alpha?: number; hex?: string };
  if (color.alpha === undefined || color.alpha === 1) {
    return color.hex ?? `rgb(${color.components.map((c) => Math.round(c * 255)).join(' ')})`;
  }
  const rgb = color.components.map((c) => Math.round(c * 255)).join(' ');
  return `rgb(${rgb} / ${num(color.alpha * 100)}%)`;
}

function dimensionCss(value: unknown, path: readonly string[]): string {
  if (!isDim(value)) throw new Error(`Invalid dimension at ${path.join('.')}`);
  // Text sizes follow the user's font-size setting: px in the source, rem in CSS.
  if (value.unit === 'px' && path[0] === 'font' && path[1] === 'size') {
    return `${num(value.value / REM_BASE)}rem`;
  }
  return `${num(value.value)}${value.unit}`;
}

function fontFamilyCss(value: unknown): string {
  const families = Array.isArray(value) ? (value as string[]) : [String(value)];
  return families.map((name) => (/\s|^\d/.test(name) ? `"${name}"` : name)).join(', ');
}

function shadowCss(value: unknown, path: readonly string[]): string {
  const layers = Array.isArray(value) ? value : [value];
  if (layers.length === 0) return 'none';
  return layers
    .map((layer: Record<string, unknown>) => {
      const part = (field: string, type: 'dimension' | 'color'): string =>
        asVar(layer[field]) ??
        (type === 'color' ? colorCss(layer[field]) : dimensionCss(layer[field], path));
      const inset = layer.inset === true ? 'inset ' : '';
      return `${inset}${part('offsetX', 'dimension')} ${part('offsetY', 'dimension')} ${part('blur', 'dimension')} ${part('spread', 'dimension')} ${part('color', 'color')}`;
    })
    .join(', ');
}

/** CSS text for a leaf value of the given DTCG type. Aliases become `var()`. */
function valueCss(type: string, value: unknown, path: readonly string[], unit?: string): string {
  const alias = asVar(value);
  if (alias) return alias;
  switch (type) {
    case 'color':
      return colorCss(value);
    case 'dimension':
      return dimensionCss(value, path);
    case 'duration': {
      const d = value as Dim;
      return `${num(d.value)}${d.unit}`;
    }
    case 'cubicBezier':
      return `cubic-bezier(${(value as number[]).map(num).join(', ')})`;
    case 'fontFamily':
      return fontFamilyCss(value);
    case 'fontWeight':
      return String(value);
    case 'number':
      return `${num(value as number)}${unit ?? ''}`;
    case 'shadow':
      return shadowCss(value, path);
    default:
      throw new Error(`No CSS mapping for $type "${type}" (${path.join('.')})`);
  }
}

/** `n/d` ratios and plain numbers accepted by `$extensions.tessen.factor`. */
function factorCss(factor: number | string): string {
  if (typeof factor === 'number') return num(factor);
  const match = /^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(factor);
  if (!match) throw new Error(`Invalid factor "${factor}"`);
  return `${match[1]} / ${match[2]}`;
}

export function factorValue(factor: number | string): number {
  if (typeof factor === 'number') return factor;
  const [n, d] = factor.split('/').map(Number);
  return (n as number) / (d as number);
}

export interface Declaration {
  name: string;
  value: string;
}

const TYPOGRAPHY_FIELDS = [
  ['fontFamily', 'font-family', 'fontFamily'],
  ['fontSize', 'font-size', 'dimension'],
  ['fontWeight', 'font-weight', 'fontWeight'],
  ['lineHeight', 'line-height', 'number'],
  ['letterSpacing', 'letter-spacing', 'number'],
] as const;

export const TYPOGRAPHY_SUFFIXES = TYPOGRAPHY_FIELDS.map(([, suffix]) => suffix);

/**
 * CSS declarations of a token for one value. With `live`, aliases and derived
 * values stay as `var()` / `calc()`; without it the value is fully resolved.
 */
export function declarations(
  token: ModelToken,
  value: unknown,
  { live }: { live: boolean },
): Declaration[] {
  const name = cssVarName(token.path);
  if (CSS_EXCLUDED_ROOTS.has(token.path[0] as string)) return [];

  if (token.type === 'typography') {
    // A whole-style alias maps each property variable to the same property of its target.
    const alias = typeof value === 'string' ? REFERENCE.exec(value)?.[1] : undefined;
    if (alias) {
      return TYPOGRAPHY_FIELDS.map(([, suffix]) => ({
        name: `${name}-${suffix}`,
        value: `var(${cssVarName(alias.split('.'))}-${suffix})`,
      }));
    }
    const fields = value as Record<string, unknown>;
    return TYPOGRAPHY_FIELDS.map(([field, suffix, type]) => ({
      name: `${name}-${suffix}`,
      value: valueCss(type, fields[field], token.path),
    }));
  }

  const { deriveFrom, factor, unit } = token.extensions;
  if (live && deriveFrom && factor !== undefined) {
    return [
      {
        name,
        value: `calc(${refToVar(deriveFrom)} * ${factorCss(factor)})`,
      },
    ];
  }
  return [{ name, value: valueCss(token.type, value, token.path, unit) }];
}

/** Resolved CSS value of every variable, per theme (default density). */
export function resolvedVariables(model: Model, theme: Theme): Record<string, string> {
  const out: Record<string, string> = {};
  for (const token of model.tokens) {
    const mode =
      token.modes?.axis === 'theme'
        ? token.modes.values[theme]
        : token.modes?.axis === 'density'
          ? token.modes.values.default
          : undefined;
    const value = mode ? mode.resolved : token.resolved;
    for (const { name, value: css } of declarations(token, value, { live: false })) out[name] = css;
  }
  return out;
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const indent = (decls: Declaration[], pad: string): string =>
  decls.map(({ name, value }) => `${pad}${name}: ${value};`).join('\n');

function liveDeclarations(
  tokens: ModelToken[],
  pick: (token: ModelToken) => unknown,
): Declaration[] {
  return tokens.flatMap((token) => declarations(token, pick(token), { live: true }));
}

const HEADER = `/*
 * @tessen-ui/tokens - generated file, do not edit.
 * Source: the DTCG 2025.10 JSON files in packages/tokens/src. Regenerate with \`pnpm build\`.
 */`;

/** Same layer order as @tessen-ui/styles; repeating it makes this file usable on its own. */
const LAYER_ORDER =
  '@layer tessen.reset, tessen.tokens, tessen.base, tessen.components, tessen.utilities;';

export function renderCss(model: Model): string {
  const common = model.tokens.filter((t) => !t.modes);
  const themed = model.tokens.filter((t) => t.modes?.axis === 'theme');
  const densities = model.tokens.filter((t) => t.modes?.axis === 'density');
  const section = (title: string, decls: Declaration[]): string =>
    decls.length ? `    /* ${title} */\n${indent(decls, '    ')}\n` : '';

  const primitives = liveDeclarations(
    common.filter((t) => t.layer === 'primitive'),
    (t) => t.original,
  );
  const semantic = liveDeclarations(
    common.filter((t) => t.layer !== 'primitive'),
    (t) => t.original,
  );
  const modeValue = (axis: Theme | Density) => (t: ModelToken) =>
    (t.modes?.values[axis] ?? { original: t.original }).original;

  const blocks: string[] = [];
  blocks.push(
    `  :root {\n    color-scheme: light dark;\n${section('Primitives', primitives)}${section('Semantic', semantic)}${section('Semantic color, light', liveDeclarations(themed, modeValue('light')))}${section('Density', liveDeclarations(densities, modeValue('default')))}  }`,
  );

  const dark = liveDeclarations(themed, modeValue('dark'));
  blocks.push(
    `  @media (prefers-color-scheme: dark) {\n    :root:not([data-${CSS_PREFIX}-theme]) {\n      color-scheme: dark;\n${indent(dark, '      ')}\n    }\n  }`,
  );
  blocks.push(
    `  [data-${CSS_PREFIX}-theme='light'] {\n    color-scheme: light;\n${indent(liveDeclarations(themed, modeValue('light')), '    ')}\n  }`,
  );
  blocks.push(
    `  [data-${CSS_PREFIX}-theme='dark'] {\n    color-scheme: dark;\n${indent(dark, '    ')}\n  }`,
  );
  for (const mode of DENSITIES) {
    blocks.push(
      `  [data-${CSS_PREFIX}-density='${mode}'] {\n${indent(liveDeclarations(densities, modeValue(mode)), '    ')}\n  }`,
    );
  }

  return `${HEADER}\n\n${LAYER_ORDER}\n\n@layer tessen.tokens {\n${blocks.join('\n\n')}\n}\n`;
}

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

export function renderJson(model: Model): string {
  const tokens = model.tokens.map((token) => ({
    path: token.key,
    type: token.type,
    layer: token.layer,
    ...(token.description ? { description: token.description } : {}),
    ...(token.alias ? { alias: token.alias } : {}),
    ...(Object.keys(token.extensions).length ? { extensions: token.extensions } : {}),
    cssVariables: declarations(token, token.resolved, { live: false }).map((d) => d.name),
    ...(token.modes
      ? {
          modeAxis: token.modes.axis,
          values: Object.fromEntries(
            Object.entries(token.modes.values).map(([mode, v]) => [mode, v.resolved]),
          ),
          // Per-mode alias target, so consumers (Theme Studio) can re-resolve after a palette change.
          aliases: Object.fromEntries(
            Object.entries(token.modes.values).flatMap(([mode, v]) => {
              const target =
                typeof v.original === 'string' ? REFERENCE.exec(v.original)?.[1] : undefined;
              return target ? [[mode, target]] : [];
            }),
          ),
        }
      : { value: token.resolved }),
  }));
  return `${JSON.stringify(
    {
      name: '@tessen-ui/tokens',
      format: 'DTCG 2025.10 values, resolved',
      cssVariablePrefix: `--${CSS_PREFIX}-`,
      themes: THEMES,
      densities: DENSITIES,
      tokens,
    },
    null,
    2,
  )}\n`;
}

// ---------------------------------------------------------------------------
// TypeScript
// ---------------------------------------------------------------------------

type Nested = { [key: string]: Nested | string };

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const key = (name: string): string => (IDENTIFIER.test(name) ? name : JSON.stringify(name));

function insert(root: Nested, path: readonly string[], leaf: Nested | string): void {
  let node = root;
  for (const segment of path.slice(0, -1)) {
    const next = node[segment];
    if (typeof next === 'string')
      throw new Error(`Token path collides with a group: ${path.join('.')}`);
    node = node[segment] = next ?? {};
  }
  node[path.at(-1) as string] = leaf;
}

/** Nested object whose leaves are `var(--tessen-...)` references. */
function referenceTree(model: Model): Nested {
  const root: Nested = {};
  for (const token of model.tokens) {
    const decls = declarations(token, token.resolved, { live: false });
    if (decls.length === 0) continue;
    if (token.type === 'typography') {
      const sub: Nested = {};
      const fields = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];
      decls.forEach((d, i) => (sub[fields[i] as string] = `var(${d.name})`));
      insert(root, token.path, sub);
    } else {
      insert(root, token.path, `var(${decls[0]?.name})`);
    }
  }
  return root;
}

function printObject(node: Nested, depth: number, mode: 'value' | 'type'): string {
  const pad = '  '.repeat(depth + 1);
  const end = '  '.repeat(depth);
  const lines = Object.entries(node).map(([name, child]) => {
    const body =
      typeof child === 'string' ? JSON.stringify(child) : printObject(child, depth + 1, mode);
    return mode === 'value'
      ? `${pad}${key(name)}: ${body},`
      : `${pad}readonly ${key(name)}: ${body};`;
  });
  return `{\n${lines.join('\n')}\n${end}}`;
}

/** Viewport breakpoints in px: usable in JS media queries and by the Tailwind bridge. */
function breakpoints(model: Model): Record<string, number> {
  const out: Record<string, number> = {};
  for (const token of model.tokens) {
    if (token.path[0] !== 'breakpoint') continue;
    const dim = token.resolved as Dim;
    out[token.path.slice(1).join('.')] = dim.unit === 'rem' ? dim.value * REM_BASE : dim.value;
  }
  return out;
}

export function renderJs(model: Model): string {
  const refs = referenceTree(model);
  const vars = Object.fromEntries(THEMES.map((theme) => [theme, resolvedVariables(model, theme)]));
  return `// @tessen-ui/tokens - generated file, do not edit.
// Source: the DTCG JSON files in packages/tokens/src. Regenerate with \`pnpm build\`.

/** Every token as a \`var(--tessen-...)\` reference, in the shape of its DTCG path. */
export const tokens = ${printObject(refs, 0, 'value')};

/** Viewport breakpoints in px. CSS variables cannot be used inside \`@media\`. */
export const breakpoints = ${JSON.stringify(breakpoints(model), null, 2)};

/** Themes the stylesheet defines through \`data-${CSS_PREFIX}-theme\`. */
export const themes = ${JSON.stringify(THEMES)};

/** Resolved value of every CSS variable, per theme (default density). */
export const cssVariables = ${JSON.stringify(vars, null, 2)};
`;
}

export function renderDts(model: Model): string {
  const refs = referenceTree(model);
  const names = Object.keys(resolvedVariables(model, 'light'));
  const bp = Object.keys(breakpoints(model));
  return `// @tessen-ui/tokens - generated file, do not edit.

export declare const tokens: ${printObject(refs, 0, 'type')};

export type CssVariableName =
${names.map((n) => `  | ${JSON.stringify(n)}`).join('\n')};

export declare const breakpoints: {
${bp.map((n) => `  readonly ${key(n)}: number;`).join('\n')}
};

export type Theme = ${THEMES.map((t) => JSON.stringify(t)).join(' | ')};

export declare const themes: readonly [${THEMES.map((t) => JSON.stringify(t)).join(', ')}];

export declare const cssVariables: { readonly [T in Theme]: { readonly [N in CssVariableName]: string } };
`;
}
