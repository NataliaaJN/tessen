import { hexToRgb, rgbToHex } from './color.ts';
import { BASE_ACCENT } from './model.ts';
import type { Theme, ThemeMode } from './model.ts';
import { generateScale, STEPS } from './scale.ts';

/** Structural subset of `@tessen-ui/tokens/tokens.json` (the theme package does not import tokens). */
export interface TokenRecord {
  path: string;
  type: string;
  layer: 'primitive' | 'semantic';
  description?: string;
  /** Alias of the default (light) mode. */
  alias?: string;
  /** Alias per mode, when the token is a plain alias in that mode. */
  aliases?: Record<string, string>;
  cssVariables: string[];
  value?: unknown;
  values?: Record<string, unknown>;
}

export interface TokenData {
  tokens: TokenRecord[];
}

export const CSS_PREFIX = '--tessen-';

/** `color.brand.600` -> `--tessen-color-brand-600`. */
export const cssVariable = (path: string): string => `${CSS_PREFIX}${path.replace(/\./g, '-')}`;

/** Colors the theme replaces in the raw palette: the accent ramp and the advanced overrides. */
export function themePrimitives(theme: Theme): Record<string, string> {
  const out: Record<string, string> = {};
  if (theme.accent.toUpperCase() !== BASE_ACCENT) {
    const scale = generateScale(theme.accent);
    for (const step of STEPS) {
      out[`color.brand.${step}`] = scale[step];
      out[`color.accent.${step}`] = scale[step];
    }
  }
  return { ...out, ...theme.overrides.primitives };
}

const hexOf = (value: unknown): string | undefined =>
  typeof value === 'object' && value !== null && 'hex' in value
    ? String((value as { hex: unknown }).hex)
    : undefined;

export interface Resolver {
  /** Final hex of a color token in a mode, or `undefined` when it is not a plain color. */
  color(path: string, mode: ThemeMode): string | undefined;
  tokens: Map<string, TokenRecord>;
}

/** Resolves colors the way the browser will, given the theme's overrides. */
export function createResolver(theme: Theme, data: TokenData): Resolver {
  const tokens = new Map(data.tokens.map((t) => [t.path, t]));
  const primitives = themePrimitives(theme);

  function color(path: string, mode: ThemeMode, depth = 0): string | undefined {
    if (depth > 12) return undefined;
    const token = tokens.get(path);
    if (!token || token.type !== 'color') return undefined;
    if (token.layer === 'primitive') return primitives[path] ?? hexOf(token.value);

    const override = theme.overrides[mode][path];
    if (override) {
      const alias = /^\{(.+)\}$/.exec(override)?.[1];
      return alias ? color(alias, mode, depth + 1) : override;
    }
    const alias = token.aliases?.[mode] ?? (mode === 'light' ? token.alias : undefined);
    if (alias) return color(alias, mode, depth + 1);
    return hexOf(token.values?.[mode]) ?? hexOf(token.value);
  }

  return { color, tokens };
}

export function rgbOf(hex: string): readonly [number, number, number] {
  return hexToRgb(hex);
}

export function normalise(hex: string): string {
  return rgbToHex(hexToRgb(hex));
}
