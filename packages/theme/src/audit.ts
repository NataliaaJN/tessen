import { contrast, hexToRgb, oklchToRgb, rgbToHex, rgbToOklch } from './color.ts';
import type { Theme, ThemeMode } from './model.ts';
import { createResolver } from './resolve.ts';
import type { TokenData } from './resolve.ts';

/** One entry of `@tessen-ui/tokens/contrast-pairs.json`. */
export interface ContrastPair {
  foreground: string;
  backgrounds: string[];
  min: number;
  kind: 'text' | 'large-text' | 'ui';
}

export interface ContrastCheck {
  mode: ThemeMode;
  foreground: string;
  background: string;
  fgHex: string;
  bgHex: string;
  ratio: number;
  min: number;
  kind: ContrastPair['kind'];
  pass: boolean;
  /** A foreground that reaches `min` against the background, when the pair fails. */
  suggestion?: string;
}

export interface AuditResult {
  checks: ContrastCheck[];
  failures: ContrastCheck[];
  /** Rounded to 2 decimals; the lowest ratio over all checks relative to its minimum. */
  worst?: ContrastCheck;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Contrast ratio (1..21) of two hex colors. */
export function contrastRatio(fg: string, bg: string): number {
  return contrast(hexToRgb(fg), hexToRgb(bg));
}

/**
 * Moves the foreground along its OKLCH lightness (same hue and chroma) away from the background
 * until it reaches `min`. Returns `undefined` when not even black or white would do.
 */
export function suggestForeground(
  fg: string,
  bg: string | readonly string[],
  min: number,
): string | undefined {
  const list = Array.isArray(bg) ? (bg as readonly string[]) : [bg as string];
  return suggestAgainst(
    fg,
    list.map((b) => ({ bg: b, min })),
  );
}

interface Target {
  bg: string;
  min: number;
}

/** Like `suggestForeground`, but every background carries its own minimum. */
function suggestAgainst(fg: string, targets: readonly Target[]): string | undefined {
  const rgbs = targets.map((t) => ({ rgb: hexToRgb(t.bg), min: t.min }));
  const lch = rgbToOklch(hexToRgb(fg));
  // Away from the backgrounds (their mean lightness), so every one of them ends up covered.
  const mean = rgbs.reduce((sum, t) => sum + rgbToOklch(t.rgb).l, 0) / rgbs.length;
  const direction = lch.l >= mean ? 1 : -1;
  for (let i = 0; i <= 100; i++) {
    const l = Math.min(1, Math.max(0, lch.l + direction * (i / 100)));
    const rgb = oklchToRgb({ ...lch, l });
    if (rgbs.every((t) => contrast(rgb, t.rgb) >= t.min)) return rgbToHex(rgb);
    if (l === 0 || l === 1) break;
  }
  return undefined;
}

/** Checks every foreground/background pair of the contrast table in light and dark. */
export function auditTheme(theme: Theme, data: TokenData, pairs: ContrastPair[]): AuditResult {
  const resolver = createResolver(theme, data);
  const checks: ContrastCheck[] = [];
  const targetsOf = (mode: ThemeMode, foreground: string): Target[] =>
    pairs
      .filter((p) => p.foreground === foreground)
      .flatMap((p) =>
        p.backgrounds.flatMap((b) => {
          const hex = resolver.color(b, mode);
          return hex ? [{ bg: hex, min: p.min }] : [];
        }),
      );
  for (const mode of ['light', 'dark'] as const) {
    for (const pair of pairs) {
      const fgHex = resolver.color(pair.foreground, mode);
      if (!fgHex) continue;
      for (const background of pair.backgrounds) {
        const bgHex = resolver.color(background, mode);
        if (!bgHex) continue;
        const ratio = round2(contrastRatio(fgHex, bgHex));
        const pass = ratio >= pair.min;
        const suggestion = pass
          ? undefined
          : suggestAgainst(fgHex, targetsOf(mode, pair.foreground));
        checks.push({
          mode,
          foreground: pair.foreground,
          background,
          fgHex,
          bgHex,
          ratio,
          min: pair.min,
          kind: pair.kind,
          pass,
          ...(suggestion ? { suggestion } : {}),
        });
      }
    }
  }
  const failures = checks.filter((c) => !c.pass);
  const worst = [...checks].sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0];
  return { checks, failures, ...(worst ? { worst } : {}) };
}

/** What a seed color looks like before the scale is built from it. */
export function describeSeed(hex: string): {
  white: number;
  black: number;
  l: number;
  c: number;
  h: number;
} {
  const rgb = hexToRgb(hex);
  const { l, c, h } = rgbToOklch(rgb);
  return {
    white: round2(contrast(rgb, [1, 1, 1])),
    black: round2(contrast(rgb, [0, 0, 0])),
    l: round2(l),
    c: round2(c),
    h: Math.round(h),
  };
}
