/** Pure variant resolution (the future `@tessen-ui/core` `defineVariants`). No framework imports. */

type BooleanVariant = 'boolean';
type VariantSpec = readonly string[] | BooleanVariant;

type PropOf<S extends VariantSpec> = S extends BooleanVariant
  ? boolean
  : S extends readonly (infer V)[]
    ? V
    : never;

export interface VariantsConfig<V extends Record<string, VariantSpec>> {
  base: string;
  variants: V;
  defaults: { [K in keyof V]: PropOf<V[K]> };
}

export type VariantProps<V extends Record<string, VariantSpec>> = {
  [K in keyof V]?: PropOf<V[K]> | undefined;
};

export interface VariantResult {
  class: string;
  attrs: Record<string, string>;
}

export interface VariantsFn<V extends Record<string, VariantSpec>> {
  (props?: VariantProps<V>): VariantResult;
  readonly config: VariantsConfig<V>;
}

/**
 * `defineVariants` -> a function props => { class, attrs }.
 * Enumerated variants always emit `data-<name>`; boolean variants only when true.
 * Unknown values throw: the contract is the source of truth, not a silent fallback.
 */
export function defineVariants<const V extends Record<string, VariantSpec>>(
  config: VariantsConfig<V>,
): VariantsFn<V> {
  const fn = (props: VariantProps<V> = {}): VariantResult => {
    const attrs: Record<string, string> = {};
    for (const name of Object.keys(config.variants) as (keyof V & string)[]) {
      const spec = config.variants[name]!;
      const value = (props[name] ?? config.defaults[name]) as string | boolean;
      if (spec === 'boolean') {
        if (value === true) attrs[`data-${name}`] = '';
      } else {
        if (!(spec as readonly string[]).includes(value as string)) {
          throw new RangeError(
            `Invalid ${name}="${String(value)}"; expected one of ${(spec as readonly string[]).join(', ')}`,
          );
        }
        attrs[`data-${name}`] = value as string;
      }
    }
    return { class: config.base, attrs };
  };
  return Object.assign(fn, { config });
}
