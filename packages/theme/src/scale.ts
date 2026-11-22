import { hexToRgb, oklchToRgb, rgbToHex, rgbToOklch } from './color.ts';

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Step = (typeof STEPS)[number];
export type Scale = Record<Step, string>;

/** Same lightness ladder and chroma profile as packages/tokens (`pnpm tokens:scales`). */
const LIGHTNESS = [0.975, 0.94, 0.885, 0.81, 0.73, 0.65, 0.57, 0.49, 0.41, 0.33, 0.22];
const CHROMA_PROFILE = [0.1, 0.22, 0.42, 0.65, 0.88, 1, 1, 0.92, 0.78, 0.6, 0.42];

const MIN_CHROMA = 0.03;
const MAX_CHROMA = 0.2;

/**
 * Builds an 11-step OKLCH ramp from one seed color. The seed gives hue and peak chroma; lightness
 * follows the fixed Tessen ladder, so the steps the semantic layer picks (800 behind white text,
 * 700 for links, 400 on dark surfaces) keep their contrast whatever the hue.
 */
export function generateScale(seedHex: string): Scale {
  const seed = rgbToOklch(hexToRgb(seedHex));
  const peak = Math.min(MAX_CHROMA, Math.max(MIN_CHROMA, seed.c));
  const out = {} as Scale;
  STEPS.forEach((step, i) => {
    out[step] = rgbToHex(
      oklchToRgb({ l: LIGHTNESS[i] as number, c: peak * (CHROMA_PROFILE[i] as number), h: seed.h }),
    );
  });
  return out;
}

/** True for a `#rgb` or `#rrggbb` string. */
export function isHex(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

/** Normalises `#abc` / `#aabbcc` to upper-case `#AABBCC`. */
export function normalizeHex(value: string): string {
  return rgbToHex(hexToRgb(value));
}
