import type { Contract, PropSpec, Scene, SceneChild, SceneNode, SceneValue } from '@tessen-ui/core';
import type { Control, ControlState, ControlValue, Recipe } from './types.ts';

/** Builds a scene node: `h('Button', { variant: 'outline' }, 'Save')`. */
export function h(
  c: string,
  p?: Record<string, SceneValue | undefined>,
  ...k: SceneChild[]
): SceneNode {
  const node: SceneNode = { c };
  if (p && Object.keys(p).length > 0) node.p = p;
  if (k.length > 0) node.k = k;
  return node;
}

/** A node with named slots (Vue `#header`, React `header={...}`). */
export const withSlots = (node: SceneNode, s: Record<string, SceneChild[]>): SceneNode => ({
  ...node,
  s,
});

/**
 * Props that are never offered as controls straight from the contract: they are either controlled
 * (the Playground uses the uncontrolled `default*` twin), structured data, or need a real value.
 */
const NOT_CONTROLS = new Set([
  'items',
  'value',
  'page',
  'open',
  'checked',
  'pressed',
  'toaster',
  'name',
  'href',
  'src',
  'alt',
  'defaultValue',
  'defaultPage',
  'pageCount',
  'siblings',
  'min',
  'max',
  'step',
  'openDelay',
  'closeDelay',
  'type',
  'aria-label',
]);

const humanize = (name: string): string =>
  name.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

function fromProp(spec: PropSpec): Control | undefined {
  const label = humanize(spec.name);
  if (spec.type === 'boolean') {
    return { kind: 'boolean', name: spec.name, label, default: spec.default === true };
  }
  if (spec.type === 'enum' && spec.values && spec.values.length > 0) {
    const fallback = spec.values[0] as string;
    const def = typeof spec.default === 'string' ? spec.default : fallback;
    return { kind: 'select', name: spec.name, label, options: spec.values, default: def };
  }
  if (spec.type === 'string') {
    return { kind: 'text', name: spec.name, label, default: String(spec.default ?? '') };
  }
  return undefined;
}

export const kebab = (name: string): string =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export interface RecipeInput {
  contract: Contract;
  /** Contract props to hide from the controls (on top of the global list). */
  skip?: string[];
  /** Own controls. One named like a contract prop replaces it; others are free (`text`). */
  controls?: Control[];
  /** Initial values that differ from each control's default. */
  defaults?: ControlState;
  build: (state: ControlState, root: Record<string, SceneValue>) => SceneNode | Scene;
}

export function defineRecipe(input: RecipeInput): Recipe {
  const { contract } = input;
  const skip = new Set([...NOT_CONTROLS, ...(input.skip ?? [])]);
  const own = input.controls ?? [];
  const ownNames = new Set(own.map((c) => c.name));
  const propSpecs = new Map(contract.props.map((p) => [p.name, p]));

  const derived = contract.props
    .filter((p) => !skip.has(p.name) && !ownNames.has(p.name))
    .map(fromProp)
    .filter((c): c is Control => c !== undefined);
  const controls = [...derived, ...own];

  const initial: ControlState = {};
  for (const c of controls) initial[c.name] = c.default;
  Object.assign(initial, input.defaults);

  const rootProps = controls.map((c) => c.name).filter((n) => propSpecs.has(n));

  const build = (state: ControlState): Scene => {
    const root: Record<string, SceneValue> = {};
    for (const name of rootProps) {
      const value: ControlValue | undefined = state[name];
      const spec = propSpecs.get(name) as PropSpec;
      if (value === undefined || value === '' || value === spec.default) continue;
      if (value === false && !spec.default) continue;
      root[name] = value;
    }
    const out = input.build({ ...initial, ...state }, root);
    return 'root' in out ? out : { root: out };
  };

  return {
    slug: kebab(contract.name),
    name: contract.names.react,
    category: contract.category,
    controls,
    initial,
    rootProps,
    build,
  };
}

/** Shorthand for the own controls recipes use all the time. */
export const text = (name: string, label: string, def: string): Control => ({
  kind: 'text',
  name,
  label,
  default: def,
});
export const flag = (name: string, label: string, def = false): Control => ({
  kind: 'boolean',
  name,
  label,
  default: def,
});
export const num = (
  name: string,
  label: string,
  def: number,
  range: { min?: number; max?: number; step?: number } = {},
): Control => ({ kind: 'number', name, label, default: def, ...range });
