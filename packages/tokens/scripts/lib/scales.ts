/**
 * Color scale generation: deterministic OKLCH ramps built from the brand seeds
 * (docs/brand/README.md). The generator writes `src/primitives/color.json`;
 * `tokens:check` fails when that file drifts from what this module produces.
 *
 * A scale has 11 steps (50, 100 ... 900, 950). Lightness, chroma and hue are
 * interpolated (following the default lightness ladder) between *anchors* - steps pinned to an
 * exact brand seed - and the scale ends. Colors outside the sRGB gamut keep
 * lightness and hue and lose chroma. Roles are never chosen by eye: the
 * semantic layer picks steps and `tokens:check` validates their contrast.
 */
import { hexToRgb, oklchToRgb, rgbToHex, rgbToOklch } from './color.ts';
import type { Oklch } from './color.ts';

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Step = (typeof STEPS)[number];

/** Lightness used for scale ends and for steps with no anchor on either side. */
const DEFAULT_LIGHTNESS = [0.975, 0.94, 0.885, 0.81, 0.73, 0.65, 0.57, 0.49, 0.41, 0.33, 0.22];
/** Chroma multipliers: pale tints and near-black ends carry less chroma. */
const CHROMA_PROFILE = [0.1, 0.22, 0.42, 0.65, 0.88, 1, 1, 0.92, 0.78, 0.6, 0.42];

export interface ScaleSpec {
  description: string;
  /** Steps pinned to an exact seed color. */
  anchors?: Partial<Record<Step, string>>;
  /** Hue (degrees) for unanchored scales. */
  hue?: number;
  /** Peak chroma for unanchored scales. */
  chroma?: number;
}

export const SEEDS = {
  primary: '#12306E',
  secondary: '#2B7BE0',
  accent: '#38C6F4',
  surfaceDark: '#0D0F13',
  surfaceLight: '#F6F7F9',
  text: '#16191F',
} as const;

export const SCALES: Record<string, ScaleSpec> = {
  neutral: {
    description:
      'Graphite neutral: a nearly colorless cool gray, so surfaces stay quiet and any accent reads true.',
    anchors: { 50: SEEDS.surfaceLight, 500: '#6F7787', 900: SEEDS.text, 950: SEEDS.surfaceDark },
  },
  brand: {
    description: 'Brand blue. 600 is the secondary seed, 900 the primary seed.',
    anchors: { 600: SEEDS.secondary, 900: SEEDS.primary },
  },
  accent: {
    description: 'Brand cyan. 400 is the accent seed. Dark-theme actions and links.',
    anchors: { 400: SEEDS.accent },
  },
  success: { description: 'Positive feedback.', hue: 150, chroma: 0.17 },
  warning: { description: 'Cautionary feedback.', hue: 75, chroma: 0.16 },
  danger: { description: 'Destructive actions and errors.', hue: 25, chroma: 0.2 },
  info: { description: 'Neutral informational feedback.', hue: 235, chroma: 0.13 },
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

function lerpHue(a: number, b: number, t: number): number {
  const delta = ((b - a + 540) % 360) - 180;
  return (a + delta * t + 360) % 360;
}

/** Generates the 11 hex colors of one scale. */
export function generateScale(spec: ScaleSpec): Record<Step, string> {
  const anchors = new Map<number, Oklch>();
  for (const [step, hex] of Object.entries(spec.anchors ?? {})) {
    anchors.set(STEPS.indexOf(Number(step) as Step), rgbToOklch(hexToRgb(hex)));
  }

  const first = anchors.size ? [...anchors.values()][0]! : undefined;
  const hue = spec.hue ?? first?.h ?? 0;
  const peak = spec.chroma ?? Math.max(...[...anchors.values()].map((a) => a.c), 0.05);

  // Knots: scale ends (unless anchored) + anchors, in step order.
  const last = STEPS.length - 1;
  const knotAt = (index: number): Oklch =>
    anchors.get(index) ?? {
      l: DEFAULT_LIGHTNESS[index] as number,
      c: peak * (CHROMA_PROFILE[index] as number) * (anchors.size ? 0.6 : 1),
      h: hue,
    };
  const knotIndexes = [...new Set([0, ...anchors.keys(), last])].sort((a, b) => a - b);

  const out = {} as Record<Step, string>;
  STEPS.forEach((step, index) => {
    let color: Oklch;
    const anchored = anchors.get(index);
    if (anchored) {
      color = anchored;
    } else if (anchors.size === 0 || knotIndexes.includes(index)) {
      color = knotAt(index);
    } else {
      const upper = knotIndexes.find((k) => k > index) as number;
      const lower = [...knotIndexes].reverse().find((k) => k < index) as number;
      // Follow the shape of the default lightness ladder between the two knots.
      const ladder = (i: number): number => DEFAULT_LIGHTNESS[i] as number;
      const t = (ladder(index) - ladder(lower)) / (ladder(upper) - ladder(lower));
      const a = knotAt(lower);
      const b = knotAt(upper);
      color = { l: lerp(a.l, b.l, t), c: lerp(a.c, b.c, t), h: lerpHue(a.h, b.h, t) };
    }
    out[step] = anchored ? rgbToHex(hexToRgb(spec.anchors![step]!)) : rgbToHex(oklchToRgb(color));
  });
  return out;
}

/** DTCG 2025.10 sRGB color value. Components are the exact 8-bit values / 255. */
export function dtcgColor(hex: string, alpha?: number): Record<string, unknown> {
  const rgb = hexToRgb(hex);
  return {
    colorSpace: 'srgb',
    components: rgb.map((v) => Math.round(v * 255) / 255).map((v) => Number(v.toFixed(6))),
    ...(alpha !== undefined && alpha !== 1 ? { alpha } : {}),
    hex: hex.toUpperCase(),
  };
}

/** Builds the content of `src/primitives/color.json`. */
export function buildColorPrimitives(): Record<string, unknown> {
  const color: Record<string, unknown> = {
    $type: 'color',
    $description: 'Raw color primitives. Generated by `pnpm tokens:scales`; do not edit by hand.',
    white: { $value: dtcgColor('#FFFFFF') },
    black: { $value: dtcgColor('#000000') },
  };
  for (const [name, spec] of Object.entries(SCALES)) {
    const ramp = generateScale(spec);
    const group: Record<string, unknown> = { $description: spec.description };
    for (const step of STEPS) {
      const anchored = spec.anchors?.[step] !== undefined;
      group[String(step)] = {
        $value: dtcgColor(ramp[step]),
        ...(anchored ? { $description: `Brand seed ${ramp[step]}.` } : {}),
      };
    }
    color[name] = group;
  }
  return { color };
}
