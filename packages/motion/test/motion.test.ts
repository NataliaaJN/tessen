import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { presets } from '../src/presets.ts';
import { renderMotionCss } from '../scripts/lib/css.ts';

const tokensCss = readFileSync(
  fileURLToPath(import.meta.resolve('@tessen-ui/tokens/tokens.css')),
  'utf8',
);
const names = Object.keys(presets);
let css: string;
beforeAll(() => {
  css = renderMotionCss(tokensCss);
});

/** The text of the first `{...}` block that starts at `selector`. */
function blockOf(source: string, selector: string): string {
  const start = source.indexOf(selector);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Unclosed block: ${selector}`);
}

describe('presets', () => {
  it('only reference tokens that exist', () => {
    const defined = new Set([...tokensCss.matchAll(/(--tessen-[\w-]+)\s*:/g)].map((m) => m[1]));
    for (const [name, p] of Object.entries(presets)) {
      const used = [...JSON.stringify(p).matchAll(/var\((--tessen-[\w-]+)/g)].map((m) => m[1]);
      expect(
        used.filter((v) => !defined.has(v!)),
        name,
      ).toEqual([]);
      expect(defined.has(`--tessen-motion-duration-${p.duration}`), name).toBe(true);
      expect(defined.has(`--tessen-motion-easing-${p.easing}`), name).toBe(true);
    }
  });

  it('use no literal durations', () => {
    for (const [name, p] of Object.entries(presets)) {
      expect(JSON.stringify(p), name).not.toMatch(/\d\s*m?s\b/);
    }
  });

  it('exits are faster than entrances', () => {
    const rank = { fast: 0, normal: 1, slow: 2, slower: 3 };
    for (const name of names.filter((n) => n.endsWith('-out'))) {
      const entrance = presets[name.replace(/-out$/, '-in') as keyof typeof presets];
      expect(rank[presets[name as keyof typeof presets].duration], name).toBeLessThan(
        rank[entrance.duration],
      );
    }
  });

  it('animate only opacity, transform and the collapse grid track', () => {
    const allowed = new Set(['opacity', 'transform', 'grid-template-rows']);
    for (const [name, p] of Object.entries(presets)) {
      for (const property of [...Object.keys(p.from), ...Object.keys(p.to)]) {
        expect(allowed.has(property), `${name}: ${property}`).toBe(true);
      }
    }
  });
});

describe('motion.css', () => {
  it('lives in tessen.base and declares the layer order once', () => {
    expect(css.match(/^@layer [\w.]+(?:, [\w.]+)+;$/gm)).toHaveLength(1);
    expect(css).toContain('@layer tessen.base {');
    expect(css.trim().endsWith('}')).toBe(true);
    expect(css.split('{').length).toBe(css.split('}').length);
  });

  it('has keyframes and a preset variable for every preset', () => {
    for (const name of names) {
      expect(css, name).toContain(`@keyframes tessen-${name} {`);
      expect(css, name).toContain(`--tessen-motion-preset-${name}: tessen-${name} var(`);
    }
  });

  it('defines every preset again under reduced and off', () => {
    for (const selector of ["[data-tessen-motion='reduced']", "[data-tessen-motion='off']"]) {
      const text = blockOf(css, selector);
      for (const name of names) expect(text, `${selector} ${name}`).toContain(`-preset-${name}:`);
    }
  });

  it('reduced swaps displacement for a fade and drops shake', () => {
    const reduced = blockOf(css, "[data-tessen-motion='reduced']");
    expect(reduced).toContain(
      '--tessen-motion-preset-slide-up-in: var(--tessen-motion-preset-fade-in);',
    );
    expect(reduced).toContain(
      '--tessen-motion-preset-pop-in: var(--tessen-motion-preset-fade-in);',
    );
    expect(reduced).toContain(
      '--tessen-motion-preset-slide-up-out: var(--tessen-motion-preset-fade-out);',
    );
    expect(reduced).toContain('--tessen-motion-preset-shake: none;');
    expect(reduced).toContain('--tessen-motion-preset-collapse-in: tessen-collapse-in');
    expect(reduced).toContain('--tessen-motion-duration-slow: var(--tessen-motion-duration-fast);');
  });

  it('off disables every preset and zeroes the durations', () => {
    const off = blockOf(css, "[data-tessen-motion='off']");
    for (const name of names) expect(off).toContain(`--tessen-motion-preset-${name}: none;`);
    expect(off).toContain('--tessen-motion-duration-fast: var(--tessen-motion-duration-instant);');
  });

  it('follows prefers-reduced-motion unless the page overrides it', () => {
    const media = blockOf(css, '@media (prefers-reduced-motion: reduce)');
    expect(media).toContain(':where(:root:not([data-tessen-motion-override]))');
  });

  it('puts the explicit modes after the OS rule so they win', () => {
    expect(css.indexOf('@media (prefers-reduced-motion')).toBeLessThan(
      css.indexOf("[data-tessen-motion='off']"),
    );
  });
});
