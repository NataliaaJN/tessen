import { renderScene } from '@tessen-ui/core';
import { recipes } from './recipes.ts';
import type { ControlState } from './types.ts';

export interface SnippetCase {
  /** Unique, file-name safe. */
  id: string;
  slug: string;
  state: ControlState;
  vue: string;
  react: string;
}

/**
 * The states whose generated code must compile: every recipe at its defaults, and then each control
 * moved on its own (every option of a select, every boolean switched on). CI type-checks them all.
 */
export function snippetCases(): SnippetCase[] {
  const out: SnippetCase[] = [];
  for (const recipe of recipes) {
    const variants: [string, ControlState][] = [['default', { ...recipe.initial }]];
    for (const c of recipe.controls) {
      if (c.kind === 'select') {
        for (const option of c.options) {
          variants.push([`${c.name}-${option}`, { ...recipe.initial, [c.name]: option }]);
        }
      } else if (c.kind === 'boolean') {
        variants.push([`${c.name}-${!c.default}`, { ...recipe.initial, [c.name]: !c.default }]);
      }
    }
    for (const [label, state] of variants) {
      const scene = recipe.build(state);
      out.push({
        id: `${recipe.slug}--${label}`.replace(/[^a-z0-9-]+/gi, '_'),
        slug: recipe.slug,
        state,
        vue: renderScene(scene, 'vue'),
        react: renderScene(scene, 'react'),
      });
    }
  }
  return out;
}
