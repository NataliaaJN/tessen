import * as contracts from '@tessen-ui/core/contracts';
import { describe, expect, it } from 'vitest';
import { snippetCases } from '../src/features/recipes/cases.ts';
import { kebab } from '../src/features/recipes/define.ts';
import { recipeBySlug, recipes } from '../src/features/recipes/index.ts';
import { initialState, sanitizeValues } from '../src/features/state/model.ts';
import { decodeState, encodeState } from '../src/features/state/url.ts';

const contractNames = (Object.values(contracts) as unknown[])
  .filter((v) => typeof v === 'object' && v !== null && 'cases' in v && 'names' in v)
  .map((v) => (v as unknown as { name: string }).name);

describe('recipes', () => {
  it('cover every component contract, once', () => {
    const slugs = recipes.map((r) => r.slug).sort();
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual(contractNames.map((n) => kebab(n)).sort());
  });

  it('build a scene from their initial state, with a component or a tag at the root', () => {
    for (const recipe of recipes) {
      const scene = recipe.build(recipe.initial);
      expect(scene.root.c, recipe.slug).toMatch(/^[A-Za-z]+$/);
    }
  });

  it('are plain data: scenes survive a JSON round trip (they travel by postMessage)', () => {
    for (const recipe of recipes) {
      const scene = recipe.build(recipe.initial);
      expect(JSON.parse(JSON.stringify(scene)), recipe.slug).toEqual(scene);
    }
  });

  it('omit props equal to the contract default', () => {
    const button = recipeBySlug('button');
    expect(button?.build(button.initial).root.p).toBeUndefined();
    const outline = button?.build({ ...button.initial, variant: 'outline' });
    expect(outline?.root.p).toEqual({ variant: 'outline' });
  });

  it('give every control a unique name and a default of the right kind', () => {
    for (const recipe of recipes) {
      const names = recipe.controls.map((c) => c.name);
      expect(new Set(names).size, recipe.slug).toBe(names.length);
      for (const c of recipe.controls) {
        expect(typeof recipe.initial[c.name], `${recipe.slug}.${c.name}`).toBe(
          c.kind === 'boolean' ? 'boolean' : c.kind === 'number' ? 'number' : 'string',
        );
      }
    }
  });
});

describe('snippetCases', () => {
  it('has unique ids and code for both frameworks', () => {
    const cases = snippetCases();
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
    for (const c of cases) {
      expect(c.vue).toContain('<template>');
      expect(c.react).toContain('export default function Example');
    }
  });
});

describe('URL state', () => {
  it('round-trips a changed state through the hash', () => {
    const state = initialState('button');
    state.values = { ...state.values, variant: 'outline', loading: true };
    state.force = 'hover';
    state.mode = 'dark';
    state.theme = 'ambar';
    state.width = '768';
    state.code = 'react';
    state.view = 'react';
    expect(decodeState(`#${encodeState(state)}`)).toEqual(state);
  });

  it('writes only what differs from the defaults', () => {
    const hash = encodeState(initialState('button'));
    const json = atob(hash.replace('s=v1.', '').replace(/-/g, '+').replace(/_/g, '/'));
    expect(JSON.parse(json)).toEqual({ c: 'button' });
  });

  it('reads the docs spelling #c=slug&fw=react', () => {
    const state = decodeState('#c=dialog&fw=react');
    expect(state.slug).toBe('dialog');
    expect(state.code).toBe('react');
    expect(state.view).toBe('both');
  });

  it('never throws: bad input gives the defaults', () => {
    expect(decodeState('#s=v1.@@@').slug).toBe('button');
    expect(decodeState('#c=nope').slug).toBe('button');
    expect(decodeState('').slug).toBe('button');
  });

  it('drops values that do not fit the recipe', () => {
    const recipe = recipeBySlug('button');
    expect(recipe).toBeDefined();
    if (!recipe) return;
    const clean = sanitizeValues(recipe, {
      variant: 'bogus',
      loading: 'yes',
      size: 'lg',
      extra: 1,
    });
    expect(clean['variant']).toBe('primary');
    expect(clean['loading']).toBe(false);
    expect(clean['size']).toBe('lg');
    expect(clean).not.toHaveProperty('extra');
  });
});
