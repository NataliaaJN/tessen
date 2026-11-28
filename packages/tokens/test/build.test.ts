import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  cssVarName,
  renderCss,
  renderDts,
  renderJs,
  renderJson,
  resolvedVariables,
} from '../scripts/lib/emit.ts';
import { buildModel } from '../scripts/lib/model.ts';
import type { Model } from '../scripts/lib/model.ts';
import { loadSources, readSourceFiles, sourcesFromFiles } from '../scripts/lib/source.ts';

let model: Model;
let css: string;

beforeAll(async () => {
  model = await buildModel(loadSources(fileURLToPath(new URL('../src', import.meta.url))));
  css = renderCss(model);
});

/** Declarations between the first `selector {` and its closing brace. */
function block(source: string, selector: string): string {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`block "${selector}" not found`);
  return source.slice(start, source.indexOf('\n  }', start));
}

describe('naming', () => {
  it('prefixes with --tessen- and kebab-cases camelCase segments', () => {
    expect(cssVarName(['color', 'action', 'primary', 'hover'])).toBe(
      '--tessen-color-action-primary-hover',
    );
    expect(cssVarName(['font', 'lineHeight', 'normal'])).toBe('--tessen-font-line-height-normal');
  });
});

describe('css', () => {
  it('has well formed comments (a stray */ makes browsers drop the whole sheet)', () => {
    const opens = css.split('/*').length - 1;
    const closes = css.split('*/').length - 1;
    expect(closes).toBe(opens);
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(withoutComments).not.toContain('/*');
    expect(withoutComments).not.toContain('*/');
  });

  it('declares the layer order and wraps everything in @layer tessen.tokens', () => {
    expect(css).toContain(
      '@layer tessen.reset, tessen.tokens, tessen.base, tessen.components, tessen.utilities;',
    );
    expect(css).toMatch(/@layer tessen\.tokens \{\n {2}:root \{/);
  });

  it('defines the light theme on :root and follows the OS when no theme attribute is set', () => {
    const root = block(css, ':root');
    expect(root).toContain('color-scheme: light dark;');
    expect(root).toContain('--tessen-color-text-primary: var(--tessen-color-neutral-900);');
    const media = block(css, ':root:not([data-tessen-theme])');
    expect(media).toContain('--tessen-color-text-primary: var(--tessen-color-neutral-50);');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
  });

  it('scopes explicit themes to any element, not only :root', () => {
    expect(block(css, "[data-tessen-theme='dark']")).toContain('color-scheme: dark;');
    expect(block(css, "[data-tessen-theme='light']")).toContain('color-scheme: light;');
  });

  it('keeps primitives out of the theme blocks (only mode-dependent tokens repeat)', () => {
    expect(block(css, "[data-tessen-theme='dark']")).not.toContain('--tessen-color-brand-600');
    expect(block(css, "[data-tessen-theme='dark']")).not.toContain('--tessen-space-4');
  });

  it('emits aliases as var() so overriding a primitive reaches the semantic layer', () => {
    expect(css).toContain('--tessen-color-action-primary-default: var(--tessen-color-brand-700);');
    expect(css).toContain('--tessen-color-action-primary-on: var(--tessen-color-text-on-action);');
    expect(css).toContain('--tessen-elevation-raised: var(--tessen-elevation-1);');
  });

  it('derives radii from radius.base with calc()', () => {
    expect(css).toContain('--tessen-radius-base: 9px;');
    expect(css).toContain('--tessen-radius-md: calc(var(--tessen-radius-base) * 1);');
    expect(css).toContain('--tessen-radius-lg: calc(var(--tessen-radius-base) * 4 / 3);');
    expect(css).toContain('--tessen-radius-full: 9999px;');
  });

  it('converts font sizes to rem and leaves other dimensions in px', () => {
    expect(css).toContain('--tessen-font-size-md: 1rem;');
    expect(css).toContain('--tessen-font-size-sm: 0.875rem;');
    expect(css).toContain('--tessen-space-4: 16px;');
    expect(css).toContain('--tessen-size-control-md: 36px;');
  });

  it('writes letter spacing in em and quotes font names with spaces', () => {
    expect(css).toContain('--tessen-font-letter-spacing-wide: 0.02em;');
    expect(css).toMatch(/--tessen-font-family-mono: "JetBrains Mono", ui-monospace/);
    expect(css).toMatch(/--tessen-font-family-sans: "Manrope Variable", .*"Segoe UI"/);
  });

  it('expands composite typography into one variable per property', () => {
    expect(css).toContain('--tessen-typography-body-md-font-size: var(--tessen-font-size-md);');
    expect(css).toContain(
      '--tessen-typography-body-md-line-height: var(--tessen-font-line-height-normal);',
    );
    expect(css).toContain(
      '--tessen-typography-body-md-letter-spacing: var(--tessen-font-letter-spacing-normal);',
    );
  });

  it('formats shadows, alpha colors, durations and easings', () => {
    expect(css).toContain('--tessen-elevation-0: none;');
    expect(css).toContain('--tessen-elevation-1: 0px 1px 2px 0px rgb(10 26 62 / 10%);');
    expect(css).toContain('--tessen-color-overlay-scrim: rgb(0 0 0 / 50%);');
    expect(css).toContain('--tessen-motion-duration-normal: 200ms;');
    expect(css).toContain('--tessen-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);');
  });

  it('switches density through its own attribute', () => {
    expect(block(css, ':root')).toContain('--tessen-density-scale: 1;');
    expect(block(css, "[data-tessen-density='compact']")).toContain(
      '--tessen-density-scale: 0.875;',
    );
    expect(block(css, "[data-tessen-density='comfortable']")).toContain(
      '--tessen-density-scale: 1.125;',
    );
  });

  it('does not emit breakpoints (CSS variables do not work in @media)', () => {
    expect(css).not.toContain('breakpoint');
  });

  it('emits every variable name once per block', () => {
    for (const selector of [
      ':root',
      ':root:not([data-tessen-theme])',
      "[data-tessen-theme='dark']",
    ]) {
      const names = [...block(css, selector).matchAll(/^\s+(--[\w-]+):/gm)].map((m) => m[1]);
      expect(new Set(names).size, selector).toBe(names.length);
    }
  });
});

describe('resolved variables', () => {
  it('differ per theme only for mode-dependent tokens', () => {
    const light = resolvedVariables(model, 'light');
    const dark = resolvedVariables(model, 'dark');
    expect(Object.keys(light)).toEqual(Object.keys(dark));
    expect(light['--tessen-color-text-primary']).toBe('#16191F');
    expect(dark['--tessen-color-text-primary']).toBe('#F6F7F9');
    expect(light['--tessen-color-brand-600']).toBe(dark['--tessen-color-brand-600']);
    // Resolved values are literal: no var() or calc().
    for (const value of Object.values(light)) expect(value).not.toMatch(/var\(|calc\(/);
  });
});

describe('json', () => {
  it('lists every token with its layer, css variables and values', () => {
    const json = JSON.parse(renderJson(model)) as {
      themes: string[];
      tokens: {
        path: string;
        layer: string;
        cssVariables: string[];
        value?: unknown;
        values?: Record<string, unknown>;
        alias?: string;
      }[];
    };
    expect(json.themes).toEqual(['light', 'dark']);
    const byPath = new Map(json.tokens.map((t) => [t.path, t]));

    const brand = byPath.get('color.brand.600')!;
    expect(brand.layer).toBe('primitive');
    expect(brand.cssVariables).toEqual(['--tessen-color-brand-600']);
    expect((brand.value as { hex: string }).hex).toBe('#2B7BE0');

    const action = byPath.get('color.action.primary.default')!;
    expect(action.layer).toBe('semantic');
    expect(action.alias).toBe('color.brand.700');
    expect(Object.keys(action.values!)).toEqual(['light', 'dark']);
    // Per-mode alias targets: Theme Studio re-resolves semantic colors after a palette change.
    expect((action as { aliases?: unknown }).aliases).toEqual({
      light: 'color.brand.700',
      dark: 'color.accent.400',
    });

    expect(byPath.get('typography.body-md')!.cssVariables).toHaveLength(5);
    expect(byPath.get('breakpoint.md')!.cssVariables).toEqual([]);
  });
});

describe('typescript', () => {
  it('exposes var() references in the shape of the DTCG paths', async () => {
    const source = renderJs(model);
    const mod = (await import(
      `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
    )) as {
      tokens: {
        color: { action: { primary: { default: string } } };
        typography: { 'body-md': Record<string, string> };
      };
      breakpoints: Record<string, number>;
      cssVariables: Record<string, Record<string, string>>;
      themes: string[];
    };
    expect(mod.tokens.color.action.primary.default).toBe(
      'var(--tessen-color-action-primary-default)',
    );
    expect(mod.tokens.typography['body-md']!.fontSize).toBe(
      'var(--tessen-typography-body-md-font-size)',
    );
    expect(mod.breakpoints).toEqual({ sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 });
    expect(mod.themes).toEqual(['light', 'dark']);
    expect(mod.cssVariables.dark!['--tessen-color-surface-canvas']).toBe('#0D0F13');
  });

  it('declares literal types and every css variable name', () => {
    const dts = renderDts(model);
    expect(dts).toContain('readonly default: "var(--tessen-color-action-primary-default)";');
    expect(dts).toContain('| "--tessen-color-brand-600"');
    expect(dts).toContain('readonly "2xl": number;');
  });
});

describe('aliases of composite tokens', () => {
  it('maps a typography alias to the properties of its target', async () => {
    const root = fileURLToPath(new URL('../src', import.meta.url));
    const files = readSourceFiles(root);
    (files['semantic/typography.json'] as { typography: Record<string, unknown> }).typography[
      'text-default'
    ] = {
      $value: '{typography.body-md}',
    };
    const aliased = renderCss(await buildModel(sourcesFromFiles(root, files)));
    expect(aliased).toContain(
      '--tessen-typography-text-default-font-size: var(--tessen-typography-body-md-font-size);',
    );
    expect(aliased).toContain(
      '--tessen-typography-text-default-letter-spacing: var(--tessen-typography-body-md-letter-spacing);',
    );
  });
});
