import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  PRESETS,
  STEPS,
  ThemeError,
  auditTheme,
  baseDeclarations,
  contrastRatio,
  decodeTheme,
  defaultTheme,
  describeSeed,
  encodeTheme,
  generateScale,
  importTheme,
  parseTheme,
  suggestForeground,
  toCss,
  toDtcg,
  toTailwind,
  toThemeJson,
  toTypeScript,
} from '../src/index.ts';
import type { ContrastPair, TokenData } from '../src/index.ts';

const require = createRequire(import.meta.url);
const data = JSON.parse(
  readFileSync(require.resolve('@tessen-ui/tokens/tokens.json'), 'utf8'),
) as TokenData;
const pairs = (
  JSON.parse(readFileSync(require.resolve('@tessen-ui/tokens/contrast-pairs.json'), 'utf8')) as {
    pairs: ContrastPair[];
  }
).pairs;

describe('generateScale', () => {
  it('returns 11 hex steps with falling lightness', () => {
    const scale = generateScale('#2B7BE0');
    expect(Object.keys(scale)).toHaveLength(STEPS.length);
    const ratios = STEPS.map((s) => contrastRatio(scale[s], '#FFFFFF'));
    expect([...ratios].sort((a, b) => a - b)).toEqual(ratios);
  });

  it('keeps white text readable on step 800 for any hue', () => {
    for (let hue = 0; hue < 360; hue += 20) {
      const seed = `hsl-${hue}`;
      const hex = hslToHex(hue, 80, 55);
      const scale = generateScale(hex);
      expect(contrastRatio('#FFFFFF', scale[800]), seed).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('is deterministic and handles greys', () => {
    expect(generateScale('#808080')).toEqual(generateScale('#808080'));
    expect(generateScale('#000')[500]).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('theme model', () => {
  it('base theme produces no declarations', () => {
    expect(baseDeclarations(defaultTheme())).toEqual([]);
    expect(toCss(defaultTheme())).toContain('Sin diferencias');
  });

  it('parseTheme accepts the default and rejects bad values with every issue listed', () => {
    expect(parseTheme(defaultTheme())).toEqual(defaultTheme());
    try {
      parseTheme({
        accent: 'red',
        radius: 99,
        density: 'huge',
        overrides: { light: { 'color.x': 'nope' } },
      });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ThemeError);
      expect((e as ThemeError).issues.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('drops unknown keys and rejects a non-object', () => {
    expect(parseTheme({ evil: 1 })).toEqual(defaultTheme());
    expect(() => parseTheme('x')).toThrow(ThemeError);
    expect(() => parseTheme([])).toThrow(ThemeError);
  });

  it('rejects font names that could break out of CSS', () => {
    expect(() => parseTheme({ fonts: { sans: 'x"; } body { display:none' } })).toThrow(ThemeError);
  });
});

describe('export', () => {
  const theme = parseTheme({
    name: 'acme',
    accent: '#D9822B',
    radius: 12,
    density: 'compact',
    motion: 'off',
    fonts: { sans: 'IBM Plex Sans' },
    overrides: {
      primitives: { 'color.neutral.500': '#777777' },
      light: { 'color.text.link': '{color.brand.600}' },
      dark: { 'color.surface.canvas': '#000000' },
    },
  });

  it('css contains only differences and scopes mode overrides', () => {
    const css = toCss(theme);
    expect(css).toContain('--tessen-color-brand-800:');
    expect(css).toContain('--tessen-radius-base: 12px;');
    expect(css).toContain('--tessen-density-scale: 0.875;');
    expect(css).toContain('--tessen-font-family-sans: "IBM Plex Sans", ui-sans-serif');
    expect(css).toContain('--tessen-motion-duration-normal: 0ms;');
    expect(css).toContain(
      ":root[data-tessen-theme='light'] {\n  --tessen-color-text-link: var(--tessen-color-brand-600);",
    );
    expect(css).toContain(
      '@media (prefers-color-scheme: dark) {\n  :root:not([data-tessen-theme]) {',
    );
    expect(css).not.toContain('--tessen-radius-sm');
  });

  it('css honours a custom selector', () => {
    expect(toCss(theme, { selector: '.acme' })).toContain(".acme[data-tessen-theme='dark']");
  });

  it('dtcg round-trips through importTheme', () => {
    const text = JSON.stringify(toDtcg(theme));
    expect(importTheme(text)).toEqual(theme);
  });

  it('native json round-trips', () => {
    expect(importTheme(toThemeJson(theme))).toEqual(theme);
  });

  it('tailwind and typescript outputs are well formed', () => {
    const tw = toTailwind(theme);
    expect(tw).toContain('@theme inline {');
    expect(tw).toContain('--color-primary: var(--tessen-color-action-primary-default);');
    const ts = toTypeScript(theme);
    expect(ts).toContain('export const acmeVariables');
    expect(ts).toContain('export function applyAcmeTheme');
  });

  it('imports a generic DTCG file', () => {
    const doc = {
      $schema: 'https://www.designtokens.org/schemas/2025.10/format.json',
      color: {
        brand: {
          '600': {
            $type: 'color',
            $value: { colorSpace: 'srgb', components: [1, 0, 0], hex: '#FF0000' },
          },
        },
      },
      radius: { base: { $type: 'dimension', $value: { value: 8, unit: 'px' } } },
    };
    const t = importTheme(JSON.stringify(doc), 'marca.tokens.json');
    expect(t.overrides.primitives['color.brand.600']).toBe('#FF0000');
    expect(t.radius).toBe(8);
    expect(t.name).toBe('marca-tokens');
  });

  it('refuses invalid files', () => {
    expect(() => importTheme('{nope')).toThrow(ThemeError);
    expect(() => importTheme('x'.repeat(600 * 1024))).toThrow(ThemeError);
  });
});

describe('share code', () => {
  it('round-trips and stays short for simple themes', () => {
    const t = parseTheme({
      name: 'acme',
      accent: '#D9822B',
      radius: 12,
      fonts: { display: 'Fraunces' },
    });
    const code = encodeTheme(t);
    expect(code.startsWith('v1.')).toBe(true);
    expect(code.length).toBeLessThan(150);
    expect(decodeTheme(code)).toEqual(t);
  });

  it('rejects garbage', () => {
    expect(() => decodeTheme('hola')).toThrow(ThemeError);
    expect(() => decodeTheme('v1.@@@')).toThrow(ThemeError);
    expect(() => decodeTheme('v1.' + btoa('[1]'))).toThrow(ThemeError);
  });
});

describe('presets', () => {
  it('has 4 light and 4 dark presets, all valid and unique', () => {
    expect(PRESETS).toHaveLength(8);
    expect(PRESETS.filter((p) => p.theme.previewMode === 'light')).toHaveLength(4);
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(8);
  });

  it('every preset passes the contrast table in both modes', () => {
    for (const p of PRESETS) {
      const result = auditTheme(p.theme, data, pairs);
      expect(
        result.failures.map((f) => `${p.id} ${f.mode} ${f.foreground}/${f.background} ${f.ratio}`),
      ).toEqual([]);
    }
  });
});

describe('audit', () => {
  it('base theme passes everything (same table as tokens:check)', () => {
    const result = auditTheme(defaultTheme(), data, pairs);
    expect(result.checks.length).toBeGreaterThan(50);
    expect(result.failures).toEqual([]);
  });

  it('flags a bad override and proposes a fix that passes', () => {
    const theme = parseTheme({ overrides: { light: { 'color.text.primary': '#CCCCCC' } } });
    const result = auditTheme(theme, data, pairs);
    const bad = result.failures.find(
      (f) => f.foreground === 'color.text.primary' && f.mode === 'light',
    );
    expect(bad).toBeDefined();
    expect(bad!.suggestion).toBeDefined();
    expect(contrastRatio(bad!.suggestion!, bad!.bgHex)).toBeGreaterThanOrEqual(bad!.min);
  });

  it('follows aliases per mode (dark uses the accent scale)', () => {
    const theme = parseTheme({ accent: '#D9822B' });
    const result = auditTheme(theme, data, pairs);
    const dark = result.checks.find((c) => c.mode === 'dark' && c.foreground === 'color.text.link');
    const light = result.checks.find(
      (c) => c.mode === 'light' && c.foreground === 'color.text.link',
    );
    expect(dark?.fgHex).not.toBe(light?.fgHex);
  });

  it('suggestForeground returns undefined when impossible', () => {
    expect(suggestForeground('#777777', '#777777', 22)).toBeUndefined();
  });

  it('describeSeed reports contrast against white and black', () => {
    const s = describeSeed('#FFFFFF');
    expect(s.white).toBe(1);
    expect(s.black).toBe(21);
  });
});

function hslToHex(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

describe('suggestForeground over several backgrounds', () => {
  it('returns one color that passes against all of them', () => {
    const bgs = ['#F1F7FE', '#FFFFFF', '#E2EAF3'];
    const fix = suggestForeground('#CBD5E1', bgs, 4.5);
    expect(fix).toBeDefined();
    for (const bg of bgs) expect(contrastRatio(fix!, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('fixing a failing foreground clears every failure of that pair', () => {
    const bad = parseTheme({ overrides: { light: { 'color.text.primary': '#CCCCCC' } } });
    const failure = auditTheme(bad, data, pairs).failures.find(
      (f) => f.foreground === 'color.text.primary' && f.mode === 'light',
    )!;
    const fixed = parseTheme({
      overrides: { light: { 'color.text.primary': failure.suggestion! } },
    });
    const after = auditTheme(fixed, data, pairs).failures.filter(
      (f) => f.foreground === 'color.text.primary' && f.mode === 'light',
    );
    expect(after).toEqual([]);
  });
});
