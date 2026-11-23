import { recipeBySlug, recipes } from '../recipes/index.ts';
import type { ControlState, Recipe } from '../recipes/index.ts';

export type Framework = 'vue' | 'react';
export type FrameworkView = Framework | 'both';
export type ForcedState = 'none' | 'hover' | 'focus' | 'pressed';
export type Width = 'full' | '320' | '768' | '1024';

export const FORCED_STATES: readonly ForcedState[] = ['none', 'hover', 'focus', 'pressed'];
export const WIDTHS: readonly Width[] = ['full', '320', '768', '1024'];

/** Everything the URL carries. The controls are only what differs from the recipe's defaults. */
export interface PlaygroundState {
  slug: string;
  /** Which previews are shown (both by default) and which code tab is open. */
  view: FrameworkView;
  code: Framework;
  values: ControlState;
  force: ForcedState;
  mode: 'light' | 'dark';
  /** Id of a theme preset from `@tessen-ui/theme`, or `base`. */
  theme: string;
  width: Width;
}

export const DEFAULT_SLUG = 'button';

export function initialState(slug: string = DEFAULT_SLUG): PlaygroundState {
  const recipe = recipeBySlug(slug) ?? recipeBySlug(DEFAULT_SLUG) ?? (recipes[0] as Recipe);
  return {
    slug: recipe.slug,
    view: 'both',
    code: 'vue',
    values: { ...recipe.initial },
    force: 'none',
    mode: 'light',
    theme: 'base',
    width: 'full',
  };
}

/** Keeps only the entries of `values` that exist in the recipe with the right type. */
export function sanitizeValues(recipe: Recipe, values: unknown): ControlState {
  const out: ControlState = { ...recipe.initial };
  if (typeof values !== 'object' || values === null) return out;
  for (const control of recipe.controls) {
    const value = (values as Record<string, unknown>)[control.name];
    if (control.kind === 'boolean' && typeof value === 'boolean') out[control.name] = value;
    else if (control.kind === 'number' && typeof value === 'number' && Number.isFinite(value))
      out[control.name] = value;
    else if (control.kind === 'text' && typeof value === 'string') out[control.name] = value;
    else if (
      control.kind === 'select' &&
      typeof value === 'string' &&
      control.options.includes(value)
    )
      out[control.name] = value;
  }
  return out;
}
