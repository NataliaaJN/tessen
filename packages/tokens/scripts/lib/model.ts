/**
 * Token model shared by the build and the checks: every token once, with the
 * values it takes in each mode (theme or density) it varies in.
 */
import {
  DENSITIES,
  mergeTrees,
  pathKey,
  resolveTokens,
  THEMES,
  walkTokens,
  REFERENCE,
} from './source.ts';
import type {
  Density,
  Layer,
  ResolvedToken,
  Sources,
  TessenExtensions,
  Theme,
  Tree,
} from './source.ts';

export type ModeAxis = 'theme' | 'density';

export interface ModeValue {
  /** Authored value (aliases intact). */
  original: unknown;
  /** Resolved value. */
  resolved: unknown;
}

export interface ModelToken {
  path: string[];
  key: string;
  type: string;
  layer: Layer;
  description?: string;
  extensions: TessenExtensions;
  /** Authored value in the default mode. */
  original: unknown;
  /** Resolved value in the default mode (light theme, default density). */
  resolved: unknown;
  /** Dotted path when the token is a plain alias of another token. */
  alias?: string;
  /** Present when the token is defined per theme or per density. */
  modes?: { axis: ModeAxis; values: Record<string, ModeValue> };
}

export interface Model {
  tokens: ModelToken[];
  byKey: Map<string, ModelToken>;
}

function layerMap(sources: Sources): Map<string, Layer> {
  const layers = new Map<string, Layer>();
  for (const file of sources.files) {
    if (file.kind === 'theme' || file.kind === 'density') continue;
    for (const { path } of walkTokens(file.tree)) layers.set(pathKey(path), file.kind);
  }
  return layers;
}

function definedPaths(tree: Tree): Set<string> {
  return new Set([...walkTokens(tree)].map(({ path }) => pathKey(path)));
}

const extensionsOf = (token: ResolvedToken): TessenExtensions =>
  (token.$extensions?.tessen as TessenExtensions | undefined) ?? {};

export async function buildModel(sources: Sources): Promise<Model> {
  const layers = layerMap(sources);

  const themeTokens = {} as Record<Theme, ResolvedToken[]>;
  for (const theme of THEMES) {
    themeTokens[theme] = await resolveTokens(
      mergeTrees(sources.base, sources.themes[theme], sources.density.default),
    );
  }
  const densityTokens = {} as Record<Density, ResolvedToken[]>;
  for (const mode of DENSITIES) {
    densityTokens[mode] = await resolveTokens(
      mergeTrees(sources.base, sources.themes.light, sources.density[mode]),
    );
  }

  const themed = new Set<string>();
  for (const theme of THEMES)
    for (const key of definedPaths(sources.themes[theme])) themed.add(key);
  const densityDefined = new Set<string>();
  for (const mode of DENSITIES)
    for (const key of definedPaths(sources.density[mode])) densityDefined.add(key);

  const index = (tokens: ResolvedToken[]): Map<string, ResolvedToken> =>
    new Map(tokens.map((token) => [pathKey(token.path), token]));
  const byTheme = Object.fromEntries(THEMES.map((t) => [t, index(themeTokens[t])])) as Record<
    Theme,
    Map<string, ResolvedToken>
  >;
  const byDensity = Object.fromEntries(
    DENSITIES.map((d) => [d, index(densityTokens[d])]),
  ) as Record<Density, Map<string, ResolvedToken>>;

  const tokens: ModelToken[] = [];
  for (const token of themeTokens.light) {
    const key = pathKey(token.path);
    const original = token.original.$value;
    const alias = typeof original === 'string' ? REFERENCE.exec(original)?.[1] : undefined;
    const model: ModelToken = {
      path: token.path,
      key,
      type: token.$type,
      layer: layers.get(key) ?? 'semantic',
      ...(token.$description ? { description: token.$description } : {}),
      extensions: extensionsOf(token),
      original,
      resolved: token.$value,
      ...(alias ? { alias } : {}),
    };

    if (themed.has(key)) {
      model.modes = {
        axis: 'theme',
        values: Object.fromEntries(
          THEMES.map((theme) => {
            const t = byTheme[theme].get(key);
            return [theme, { original: t?.original.$value, resolved: t?.$value }];
          }),
        ),
      };
    } else if (densityDefined.has(key)) {
      model.modes = {
        axis: 'density',
        values: Object.fromEntries(
          DENSITIES.map((mode) => {
            const t = byDensity[mode].get(key);
            return [mode, { original: t?.original.$value, resolved: t?.$value }];
          }),
        ),
      };
    }
    tokens.push(model);
  }

  return { tokens, byKey: new Map(tokens.map((token) => [token.key, token])) };
}
