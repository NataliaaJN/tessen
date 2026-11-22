// Token data for the Foundations pages, read from the built @tessen-ui/tokens JSON.
import data from '@tessen-ui/tokens/tokens.json';

interface Dim {
  value: number;
  unit: string;
}
export interface Token {
  path: string;
  type: string;
  layer: 'primitive' | 'semantic';
  description?: string;
  alias?: string;
  cssVariables: string[];
  value?: unknown;
}

const all = data.tokens as Token[];

export const cssVar = (t: Token): string => t.cssVariables[0] ?? '';

export const dim = (v: unknown): string => {
  const d = v as Dim;
  return `${d.value}${d.unit}`;
};

const where = (prefix: string, layer?: Token['layer']) =>
  all.filter((t) => t.path.startsWith(prefix) && (!layer || t.layer === layer));

/** Primitive colour scales (`color.brand.50` ...), grouped by scale name. */
export function colorScales(): { name: string; steps: Token[] }[] {
  const map = new Map<string, Token[]>();
  for (const t of where('color.', 'primitive')) {
    const parts = t.path.split('.');
    const name = parts.length === 3 ? parts[1]! : 'base';
    map.set(name, [...(map.get(name) ?? []), t]);
  }
  return [...map].map(([name, steps]) => ({ name, steps }));
}

/** Semantic colour roles grouped by their first segment (`text`, `surface`, ...). */
export function semanticColors(): { group: string; tokens: Token[] }[] {
  const map = new Map<string, Token[]>();
  for (const t of where('color.', 'semantic')) {
    if (t.type !== 'color') continue;
    const group = t.path.split('.')[1]!;
    map.set(group, [...(map.get(group) ?? []), t]);
  }
  return [...map].map(([group, tokens]) => ({ group, tokens }));
}

export const spacing = () => where('space.', 'primitive');
export const radii = () => where('radius.', 'primitive').filter((t) => t.path !== 'radius.base');
export const elevations = () => where('elevation.');
export const typography = () => where('typography.', 'semantic');
export const durations = () => where('motion.duration.');
export const easings = () => where('motion.easing.');
export const fontFamilies = () => where('font.family.');

export const typographyVar = (t: Token, part: string) =>
  `var(${t.cssVariables.find((v) => v.endsWith(`-${part}`)) ?? ''})`;
