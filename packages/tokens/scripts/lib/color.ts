/**
 * Minimal color math used at build time only (scale generation and contrast
 * checks): sRGB <-> OKLCH (Björn Ottosson's OKLab) and WCAG 2.x contrast.
 * Not part of the published API.
 */

export type Rgb = readonly [number, number, number];
export type Oklch = { l: number; c: number; h: number };

const toLinear = (v: number): number => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number): number =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;

/** Parses `#rgb`, `#rrggbb` (alpha is ignored) into sRGB components in 0..1. */
export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map((ch) => ch + ch).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) throw new Error(`Invalid hex color "${hex}"`);
  const n = Number.parseInt(h.slice(0, 6), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbToHex(rgb: Rgb): string {
  const part = (v: number): string =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${part(rgb[0])}${part(rgb[1])}${part(rgb[2])}`.toUpperCase();
}

export function rgbToOklch([r, g, b]: Rgb): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(a, bb);
  const h = c < 1e-6 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

/** Unclamped linear-light sRGB; callers decide what to do about out-of-gamut values. */
function oklchToLinear({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const EPS = 1e-4;
const inGamut = (rgb: readonly number[]): boolean => rgb.every((v) => v >= -EPS && v <= 1 + EPS);

/**
 * OKLCH -> sRGB. When the color is outside the sRGB gamut, chroma is reduced
 * (lightness and hue preserved) until it fits.
 */
export function oklchToRgb(color: Oklch): Rgb {
  let lo = 0;
  let hi = color.c;
  let lin = oklchToLinear(color);
  if (!inGamut(lin)) {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear({ ...color, c: lo });
  }
  const [r, g, b] = lin.map((v) => toGamma(Math.min(1, Math.max(0, v))));
  return [r as number, g as number, b as number];
}

/** WCAG 2.x relative luminance. */
export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.x contrast ratio (1..21) of two opaque colors. */
export function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Composites `fg` with opacity `alpha` over an opaque `bg`. */
export function over(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  return [
    fg[0] * alpha + bg[0] * (1 - alpha),
    fg[1] * alpha + bg[1] * (1 - alpha),
    fg[2] * alpha + bg[2] * (1 - alpha),
  ];
}
