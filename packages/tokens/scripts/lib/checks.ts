/**
 * `tokens:check` (FND-08): static validation of the DTCG sources.
 *
 *  structure   every token has a known $type and a well formed $value
 *  references  no orphan aliases, no cycles, aliases keep the type and respect
 *              the layers (primitive < semantic < component)
 *  parity      light and dark (and every density mode) define the same tokens
 *  derive      `deriveFrom` targets exist and the literal value agrees with the factor
 *  names       CSS variable names stay unique after flattening
 *  contrast    declared pairs meet WCAG 2.x in every theme
 *  scales      src/primitives/color.json is exactly what the generator produces
 */
import { declarations, factorValue } from './emit.ts';
import { buildModel } from './model.ts';
import type { Model, ModelToken } from './model.ts';
import { contrast, hexToRgb, over } from './color.ts';
import type { Rgb } from './color.ts';
import { collectReferences, DENSITIES, mergeTrees, pathKey, THEMES, walkTokens } from './source.ts';
import type { Layer, RawToken, Sources, Tree } from './source.ts';

export type CheckName =
  'structure' | 'references' | 'parity' | 'derive' | 'names' | 'contrast' | 'scales';

export interface Issue {
  check: CheckName;
  message: string;
}

export interface CheckResult {
  issues: Issue[];
  stats: { tokens: number; contrastPairs: number };
}

const KNOWN_TYPES = new Set([
  'color',
  'dimension',
  'duration',
  'cubicBezier',
  'fontFamily',
  'fontWeight',
  'number',
  'shadow',
  'typography',
]);
const SEGMENT = /^[a-z0-9][a-zA-Z0-9-]*$/;
const KNOWN_EXTENSIONS = new Set(['deriveFrom', 'factor', 'unit', 'provisional']);
/** Layers a token of each layer may reference. Components only consume semantic tokens. */
const ALLOWED_TARGETS: Record<Layer, Layer[]> = {
  primitive: ['primitive'],
  semantic: ['primitive', 'semantic'],
  component: ['semantic', 'component'],
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isRef = (v: unknown): boolean => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

// ---------------------------------------------------------------------------
// structure
// ---------------------------------------------------------------------------

function checkColor(value: unknown): string | undefined {
  if (!isRecord(value)) return 'must be a DTCG color object';
  if (value.colorSpace !== 'srgb') return 'only the "srgb" colorSpace is supported';
  const c = value.components;
  if (!Array.isArray(c) || c.length !== 3 || !c.every((n) => isNum(n) && n >= 0 && n <= 1)) {
    return 'components must be three numbers between 0 and 1';
  }
  if (value.alpha !== undefined && !(isNum(value.alpha) && value.alpha >= 0 && value.alpha <= 1)) {
    return 'alpha must be a number between 0 and 1';
  }
  if (value.hex !== undefined) {
    if (typeof value.hex !== 'string' || !/^#[0-9A-F]{6}$/i.test(value.hex))
      return 'hex must be #RRGGBB';
    const expected = hexToRgb(value.hex);
    if (c.some((n: number, i: number) => Math.abs(n - (expected[i] as number)) > 0.002)) {
      return `hex ${value.hex} does not match components`;
    }
  }
  return undefined;
}

function checkDimension(value: unknown, units: string[]): string | undefined {
  if (!isRecord(value) || !isNum(value.value) || typeof value.unit !== 'string') {
    return `must be { value, unit } with unit ${units.join(' | ')}`;
  }
  return units.includes(value.unit)
    ? undefined
    : `unit "${value.unit}" is not allowed (${units.join(', ')})`;
}

function checkShadowLayer(layer: unknown): string | undefined {
  if (!isRecord(layer)) return 'shadow layer must be an object';
  if (!isRef(layer.color)) {
    const problem = checkColor(layer.color);
    if (problem) return `color: ${problem}`;
  }
  for (const field of ['offsetX', 'offsetY', 'blur', 'spread']) {
    if (isRef(layer[field])) continue;
    const problem = checkDimension(layer[field], ['px', 'rem']);
    if (problem) return `${field}: ${problem}`;
  }
  return undefined;
}

/** Shape of a literal (non alias) value; aliases are verified by the references check. */
function checkValue(type: string, value: unknown): string | undefined {
  if (isRef(value)) return undefined;
  switch (type) {
    case 'color':
      return checkColor(value);
    case 'dimension':
      return checkDimension(value, ['px', 'rem']);
    case 'duration':
      return checkDimension(value, ['ms', 's']);
    case 'cubicBezier':
      return Array.isArray(value) &&
        value.length === 4 &&
        value.every(isNum) &&
        (value[0] as number) >= 0 &&
        (value[0] as number) <= 1 &&
        (value[2] as number) >= 0 &&
        (value[2] as number) <= 1
        ? undefined
        : 'must be four numbers [x1, y1, x2, y2] with x1 and x2 between 0 and 1';
    case 'fontFamily':
      return typeof value === 'string' ||
        (Array.isArray(value) && value.every((f) => typeof f === 'string'))
        ? undefined
        : 'must be a string or an array of strings';
    case 'fontWeight':
      return isNum(value) && value >= 1 && value <= 1000
        ? undefined
        : 'must be a number between 1 and 1000';
    case 'number':
      return isNum(value) ? undefined : 'must be a number';
    case 'shadow': {
      const layers = Array.isArray(value) ? value : [value];
      for (const layer of layers) {
        const problem = checkShadowLayer(layer);
        if (problem) return problem;
      }
      return undefined;
    }
    case 'typography': {
      if (!isRecord(value)) return 'must be an object';
      const missing = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
      ].filter((f) => !(f in value));
      return missing.length ? `missing ${missing.join(', ')}` : undefined;
    }
    default:
      return undefined;
  }
}

function checkStructure(sources: Sources, issues: Issue[]): void {
  const push = (message: string): number => issues.push({ check: 'structure', message });
  for (const file of sources.files) {
    // Density files hold one subtree per mode; walk each separately.
    const trees = file.kind === 'density' ? Object.values(file.tree).filter(isRecord) : [file.tree];
    for (const tree of trees) {
      for (const { path, token, type } of walkTokens(tree)) {
        const where = `${file.file}: ${pathKey(path)}`;
        const bad = path.find((s) => !SEGMENT.test(s));
        if (bad !== undefined)
          push(
            `${where}: "${bad}" is not a valid name segment (lowercase, digits, "-", camelCase; no dots)`,
          );
        if (type === undefined) {
          push(`${where}: no $type (set it on the token or on a parent group)`);
          continue;
        }
        if (!KNOWN_TYPES.has(type)) {
          push(`${where}: unsupported $type "${type}"`);
          continue;
        }
        const problem = checkValue(type, token.$value);
        if (problem) push(`${where}: ${problem}`);

        const ext = isRecord(token.$extensions) ? token.$extensions.tessen : undefined;
        if (isRecord(ext)) {
          for (const name of Object.keys(ext)) {
            if (!KNOWN_EXTENSIONS.has(name))
              push(`${where}: unknown extension $extensions.tessen.${name}`);
          }
          if (
            ext.factor !== undefined &&
            !(isNum(ext.factor) || /^\d+(\.\d+)?\/\d+(\.\d+)?$/.test(String(ext.factor)))
          ) {
            push(`${where}: factor must be a number or an "n/d" ratio`);
          }
          if ((ext.deriveFrom === undefined) !== (ext.factor === undefined)) {
            push(`${where}: deriveFrom and factor go together`);
          }
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// references (orphans, cycles, types, layers)
// ---------------------------------------------------------------------------

function layerOfPath(sources: Sources): Map<string, Layer> {
  const layers = new Map<string, Layer>();
  for (const file of sources.files) {
    if (file.kind === 'theme' || file.kind === 'density') {
      const trees =
        file.kind === 'density' ? Object.values(file.tree).filter(isRecord) : [file.tree];
      for (const tree of trees)
        for (const t of walkTokens(tree)) layers.set(pathKey(t.path), 'semantic');
    } else {
      for (const t of walkTokens(file.tree)) layers.set(pathKey(t.path), file.kind);
    }
  }
  return layers;
}

function checkReferences(sources: Sources, issues: Issue[]): boolean {
  const push = (message: string): number => issues.push({ check: 'references', message });
  const layers = layerOfPath(sources);
  const before = issues.length;
  const seen = new Set<string>();

  const combos: [string, Tree][] = [
    ...THEMES.map((theme): [string, Tree] => [
      `theme ${theme}`,
      mergeTrees(sources.base, sources.themes[theme], sources.density.default),
    ]),
    ...DENSITIES.filter((m) => m !== 'default').map((mode): [string, Tree] => [
      `density ${mode}`,
      mergeTrees(sources.base, sources.themes.light, sources.density[mode]),
    ]),
  ];

  for (const [label, tree] of combos) {
    const flat = new Map<string, RawToken>();
    for (const t of walkTokens(tree)) flat.set(pathKey(t.path), t);

    const graph = new Map<string, string[]>();
    for (const [key, raw] of flat) {
      const refs = collectReferences(raw.token.$value);
      graph.set(key, refs);
      for (const ref of refs) {
        const target = flat.get(ref);
        const id = `${key}->${ref}`;
        if (!target) {
          if (!seen.has(`orphan:${id}`))
            push(`${key} references "${ref}", which does not exist (${label})`);
          seen.add(`orphan:${id}`);
          continue;
        }
        if (
          typeof raw.token.$value === 'string' &&
          target.type !== raw.type &&
          !seen.has(`type:${id}`)
        ) {
          push(`${key} (${raw.type}) is an alias of ${ref} (${target.type}): types must match`);
          seen.add(`type:${id}`);
        }
        const from = layers.get(key) ?? 'semantic';
        const to = layers.get(ref) ?? 'semantic';
        if (!ALLOWED_TARGETS[from].includes(to) && !seen.has(`layer:${id}`)) {
          push(
            `${key} (${from}) must not reference ${ref} (${to}); ${from} tokens may only reference ${ALLOWED_TARGETS[from].join(' or ')} tokens`,
          );
          seen.add(`layer:${id}`);
        }
      }
    }

    // Cycle detection (depth first, three colors).
    const state = new Map<string, 1 | 2>();
    const stack: string[] = [];
    const visit = (key: string): void => {
      if (state.get(key) === 2) return;
      if (state.get(key) === 1) {
        const cycle = [...stack.slice(stack.indexOf(key)), key].join(' -> ');
        if (!seen.has(`cycle:${cycle}`)) push(`alias cycle: ${cycle} (${label})`);
        seen.add(`cycle:${cycle}`);
        return;
      }
      state.set(key, 1);
      stack.push(key);
      for (const ref of graph.get(key) ?? []) if (graph.has(ref)) visit(ref);
      stack.pop();
      state.set(key, 2);
    };
    for (const key of graph.keys()) visit(key);
  }
  return issues.length === before;
}

// ---------------------------------------------------------------------------
// parity
// ---------------------------------------------------------------------------

function pathSet(tree: Tree): Set<string> {
  return new Set([...walkTokens(tree)].map((t) => pathKey(t.path)));
}

function checkParity(sources: Sources, issues: Issue[]): void {
  const push = (message: string): number => issues.push({ check: 'parity', message });
  const [first, ...rest] = THEMES;
  const reference = pathSet(sources.themes[first]);
  for (const theme of rest) {
    const other = pathSet(sources.themes[theme]);
    for (const key of reference)
      if (!other.has(key)) push(`${key} is defined in ${first} but missing in ${theme}`);
    for (const key of other)
      if (!reference.has(key)) push(`${key} is defined in ${theme} but missing in ${first}`);
  }
  const baseKeys = pathSet(sources.base);
  for (const theme of THEMES) {
    for (const key of pathSet(sources.themes[theme])) {
      if (baseKeys.has(key))
        push(`${key} is defined in both the base layers and themes/${theme}.json`);
    }
  }

  const densityRef = pathSet(sources.density.default);
  for (const mode of DENSITIES) {
    const keys = pathSet(sources.density[mode]);
    for (const key of densityRef)
      if (!keys.has(key)) push(`${key} is missing in density "${mode}"`);
    for (const key of keys)
      if (!densityRef.has(key)) push(`${key} exists in density "${mode}" but not in "default"`);
  }
}

// ---------------------------------------------------------------------------
// derive, names (need the resolved model)
// ---------------------------------------------------------------------------

function checkDerive(model: Model, issues: Issue[]): void {
  for (const token of model.tokens) {
    const { deriveFrom, factor } = token.extensions;
    if (deriveFrom === undefined || factor === undefined) continue;
    const target = model.byKey.get(deriveFrom);
    if (!target) {
      issues.push({
        check: 'derive',
        message: `${token.key}: deriveFrom "${deriveFrom}" does not exist`,
      });
      continue;
    }
    const a = token.resolved as { value: number; unit: string };
    const b = target.resolved as { value: number; unit: string };
    if (a.unit !== b.unit || Math.abs(b.value * factorValue(factor) - a.value) > 0.01) {
      issues.push({
        check: 'derive',
        message: `${token.key}: ${deriveFrom} (${b.value}${b.unit}) x ${factor} gives ${b.value * factorValue(factor)}${b.unit}, but the literal value is ${a.value}${a.unit}`,
      });
    }
  }
}

function checkNames(model: Model, issues: Issue[]): void {
  const owners = new Map<string, string>();
  for (const token of model.tokens) {
    for (const { name } of declarations(token, token.resolved, { live: false })) {
      const owner = owners.get(name);
      if (owner !== undefined && owner !== token.key) {
        issues.push({
          check: 'names',
          message: `${name} is produced by both ${owner} and ${token.key}`,
        });
      }
      owners.set(name, token.key);
    }
  }
}

// ---------------------------------------------------------------------------
// contrast
// ---------------------------------------------------------------------------

function resolvedColor(token: ModelToken, theme: string): { rgb: Rgb; alpha: number } | undefined {
  const mode = token.modes?.axis === 'theme' ? token.modes.values[theme]?.resolved : token.resolved;
  if (!isRecord(mode) || !Array.isArray(mode.components)) return undefined;
  return {
    rgb: mode.components as unknown as Rgb,
    alpha: typeof mode.alpha === 'number' ? mode.alpha : 1,
  };
}

function checkContrast(model: Model, sources: Sources, issues: Issue[]): number {
  let count = 0;
  for (const theme of THEMES) {
    for (const pair of sources.contrastPairs.pairs) {
      const fg = model.byKey.get(pair.foreground);
      if (!fg || fg.type !== 'color') {
        issues.push({
          check: 'contrast',
          message: `contrast-pairs: foreground "${pair.foreground}" is not a color token`,
        });
        continue;
      }
      for (const backgroundKey of pair.backgrounds) {
        const bg = model.byKey.get(backgroundKey);
        if (!bg || bg.type !== 'color') {
          issues.push({
            check: 'contrast',
            message: `contrast-pairs: background "${backgroundKey}" is not a color token`,
          });
          continue;
        }
        const f = resolvedColor(fg, theme);
        const b = resolvedColor(bg, theme);
        if (!f || !b) continue;
        count++;
        const background = over(b.rgb, b.alpha, [1, 1, 1]);
        const ratio = contrast(over(f.rgb, f.alpha, background), background);
        if (ratio + 1e-9 < pair.min) {
          issues.push({
            check: 'contrast',
            message: `${theme}: ${pair.foreground} on ${backgroundKey} is ${ratio.toFixed(2)}:1, needs ${pair.min}:1 (${pair.kind})`,
          });
        }
      }
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// entry point
// ---------------------------------------------------------------------------

export interface CheckOptions {
  /** Expected content of `src/primitives/color.json`; omit to skip the freshness check. */
  generatedScales?: { expected: unknown; actual: unknown };
}

export async function runChecks(
  sources: Sources,
  options: CheckOptions = {},
): Promise<CheckResult> {
  const issues: Issue[] = [];

  checkStructure(sources, issues);
  const referencesOk = checkReferences(sources, issues);
  checkParity(sources, issues);

  if (options.generatedScales) {
    const { expected, actual } = options.generatedScales;
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      issues.push({
        check: 'scales',
        message:
          'src/primitives/color.json is out of date: run `pnpm --filter @tessen-ui/tokens tokens:scales`',
      });
    }
  }

  let tokens = 0;
  let contrastPairs = 0;
  // The resolved model only exists when every alias resolves.
  if (referencesOk && !issues.some((i) => i.check === 'structure' || i.check === 'parity')) {
    const model = await buildModel(sources);
    tokens = model.tokens.length;
    checkDerive(model, issues);
    checkNames(model, issues);
    contrastPairs = checkContrast(model, sources, issues);
  }

  return { issues, stats: { tokens, contrastPairs } };
}
