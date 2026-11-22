/**
 * Loading and resolving the DTCG sources in `src/`.
 *
 * Layout (docs/architecture/repository-structure.md §3.1):
 *   primitives/*.json   raw scales, no UI meaning
 *   semantic/*.json     mode independent roles
 *   components/*.json   component tokens (only when a component needs one)
 *   themes/light.json   mode dependent semantic color
 *   themes/dark.json    same paths as light
 *   themes/density.json one subtree per density mode
 *
 * Style Dictionary does the heavy lifting of parsing DTCG, inheriting `$type`
 * and resolving aliases (also inside composite values).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import StyleDictionary from 'style-dictionary';
import type { DesignTokens } from 'style-dictionary/types';

export type Tree = { [key: string]: unknown };
export type Layer = 'primitive' | 'semantic' | 'component';

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
export const DENSITIES = ['default', 'compact', 'comfortable'] as const;
export type Density = (typeof DENSITIES)[number];

/** Token after Style Dictionary parsed it and resolved every alias. */
export interface ResolvedToken {
  path: string[];
  $type: string;
  /** Fully resolved value (aliases replaced by their targets). */
  $value: unknown;
  /** Value as authored (aliases intact). */
  original: { $value: unknown };
  $description?: string;
  $extensions?: { tessen?: TessenExtensions } & Record<string, unknown>;
}

/** Our own `$extensions.tessen` vocabulary (ADR 0005). */
export interface TessenExtensions {
  /** Emit as `calc(var(<deriveFrom>) * factor)` so a single base value drives a scale. */
  deriveFrom?: string;
  /** `number` or a `"n/d"` ratio. */
  factor?: number | string;
  /** Unit of a `number` token (DTCG dimensions only allow px and rem). */
  unit?: string;
  /** Value is a starting point that still has to be validated in context. */
  provisional?: boolean;
}

export interface SourceFile {
  /** Path relative to `src/`, always with forward slashes. */
  file: string;
  kind: Layer | 'theme' | 'density';
  tree: Tree;
}

export interface Sources {
  root: string;
  files: SourceFile[];
  /** primitives + semantic + components, merged. */
  base: Tree;
  themes: Record<Theme, Tree>;
  density: Record<Density, Tree>;
  /** Declared contrast pairs (src/contrast-pairs.json). */
  contrastPairs: ContrastPairs;
}

export interface ContrastPairs {
  pairs: {
    foreground: string;
    backgrounds: string[];
    min: number;
    kind: 'text' | 'large-text' | 'ui';
  }[];
}

const isRecord = (value: unknown): value is Tree =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isToken = (value: unknown): value is Tree & { $value: unknown } =>
  isRecord(value) && '$value' in value;

export const REFERENCE = /^\{([^{}]+)\}$/;

function readJson(file: string): Tree {
  return JSON.parse(readFileSync(file, 'utf8')) as Tree;
}

function jsonFilesIn(dir: string): string[] {
  return existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => name.endsWith('.json'))
        .sort()
    : [];
}

/** Deep merge; arrays and tokens are replaced, never merged. */
export function mergeTrees(...trees: Tree[]): Tree {
  const out: Tree = {};
  for (const tree of trees) {
    for (const [key, value] of Object.entries(tree)) {
      const current = out[key];
      out[key] =
        isRecord(value) && !isToken(value) && isRecord(current) && !isToken(current)
          ? mergeTrees(current, value)
          : structuredClone(value);
    }
  }
  return out;
}

/** Reads every source file under `root`, keyed by path relative to it. */
export function readSourceFiles(root: string): Record<string, Tree> {
  const files: Record<string, Tree> = {};
  for (const dir of ['primitives', 'semantic', 'components']) {
    for (const name of jsonFilesIn(join(root, dir)))
      files[`${dir}/${name}`] = readJson(join(root, dir, name));
  }
  for (const name of [...THEMES.map((t) => `${t}.json`), 'density.json']) {
    files[`themes/${name}`] = readJson(join(root, 'themes', name));
  }
  const contrast = join(root, 'contrast-pairs.json');
  if (existsSync(contrast)) files['contrast-pairs.json'] = readJson(contrast);
  return files;
}

/** Builds `Sources` from in-memory files (used by `loadSources` and by the tests). */
export function sourcesFromFiles(root: string, input: Record<string, Tree>): Sources {
  const files: SourceFile[] = [];
  for (const [dir, kind] of [
    ['primitives', 'primitive'],
    ['semantic', 'semantic'],
    ['components', 'component'],
  ] as const) {
    for (const [file, tree] of Object.entries(input)) {
      if (file.startsWith(`${dir}/`)) files.push({ file, kind, tree });
    }
  }
  const base = mergeTrees(...files.map((f) => f.tree));

  const themes = {} as Record<Theme, Tree>;
  for (const theme of THEMES) {
    const file = `themes/${theme}.json`;
    const tree = input[file] ?? {};
    files.push({ file, kind: 'theme', tree });
    themes[theme] = tree;
  }

  const densityFile = input['themes/density.json'] ?? {};
  files.push({ file: 'themes/density.json', kind: 'density', tree: densityFile });
  const density = {} as Record<Density, Tree>;
  for (const mode of DENSITIES) density[mode] = (densityFile[mode] as Tree | undefined) ?? {};

  const contrastPairs = (input['contrast-pairs.json'] ?? { pairs: [] }) as unknown as ContrastPairs;
  return { root, files, base, themes, density, contrastPairs };
}

export const loadSources = (root: string): Sources => sourcesFromFiles(root, readSourceFiles(root));

/** A token found while walking a tree, before any resolution. */
export interface RawToken {
  path: string[];
  token: Tree & { $value: unknown };
  /** `$type` of the token or the closest ancestor group. */
  type: string | undefined;
}

/** Walks a DTCG tree and yields every token with its inherited `$type`. */
export function* walkTokens(
  tree: Tree,
  path: string[] = [],
  inheritedType?: string,
): Generator<RawToken> {
  const type = typeof tree.$type === 'string' ? tree.$type : inheritedType;
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$') || !isRecord(value)) continue;
    if (isToken(value)) {
      yield {
        path: [...path, key],
        token: value,
        type: typeof value.$type === 'string' ? value.$type : type,
      };
    } else {
      yield* walkTokens(value, [...path, key], type);
    }
  }
}

/** Every alias used inside a (possibly composite) value, as dotted paths. */
export function collectReferences(value: unknown): string[] {
  if (typeof value === 'string') {
    const match = REFERENCE.exec(value);
    return match ? [match[1] as string] : [];
  }
  if (Array.isArray(value)) return value.flatMap(collectReferences);
  if (isRecord(value)) return Object.values(value).flatMap(collectReferences);
  return [];
}

/** Resolves a merged tree with Style Dictionary (aliases, `$type` inheritance). */
export async function resolveTokens(tree: Tree): Promise<ResolvedToken[]> {
  const dictionary = new StyleDictionary({
    tokens: structuredClone(tree) as DesignTokens,
    log: { verbosity: 'silent' },
    platforms: { raw: { transforms: [] } },
  });
  await dictionary.hasInitialized;
  const { allTokens } = await dictionary.getPlatformTokens('raw');
  return allTokens as unknown as ResolvedToken[];
}

export const pathKey = (path: readonly string[]): string => path.join('.');
