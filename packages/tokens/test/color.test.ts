import { describe, expect, it } from 'vitest';
import { contrast, hexToRgb, oklchToRgb, rgbToHex, rgbToOklch } from '../scripts/lib/color.ts';
import { generateScale, SCALES, SEEDS, STEPS } from '../scripts/lib/scales.ts';

const ratio = (a: string, b: string): number => contrast(hexToRgb(a), hexToRgb(b));

describe('color math', () => {
  // Ratios measured in docs/brand/README.md; the checker must agree with them.
  it.each([
    ['#FFFFFF', '#12306E', 12.55],
    ['#0A1A3E', '#F1F7FE', 15.83],
    ['#F1F7FE', '#060E24', 17.77],
    ['#38C6F4', '#060E24', 9.63],
    ['#2B7BE0', '#060E24', 4.57],
    ['#FFFFFF', '#2B7BE0', 4.19],
    ['#2B7BE0', '#F1F7FE', 3.89],
    ['#FFFFFF', '#38C6F4', 1.99],
    ['#0A1A3E', '#38C6F4', 8.58],
  ])('contrast %s on %s is %f', (fg, bg, expected) => {
    expect(ratio(fg, bg)).toBeCloseTo(expected, 1);
  });

  it('is symmetric and 1:1 for equal colors', () => {
    expect(ratio('#123456', '#123456')).toBeCloseTo(1, 5);
    expect(ratio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(ratio('#12306E', '#F1F7FE')).toBeCloseTo(ratio('#F1F7FE', '#12306E'), 10);
  });

  it('round-trips hex through OKLCH', () => {
    for (const hex of Object.values(SEEDS)) {
      expect(rgbToHex(oklchToRgb(rgbToOklch(hexToRgb(hex))))).toBe(hex);
    }
  });

  it('rejects malformed hex', () => {
    expect(() => hexToRgb('#12')).toThrow(/Invalid hex/);
  });
});

describe('scale generation', () => {
  it('produces 11 valid hex steps per scale', () => {
    for (const spec of Object.values(SCALES)) {
      const ramp = generateScale(spec);
      expect(Object.keys(ramp)).toHaveLength(11);
      for (const step of STEPS) expect(ramp[step]).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('pins anchors to the exact brand seeds', () => {
    expect(generateScale(SCALES.brand!)[600]).toBe(SEEDS.secondary);
    expect(generateScale(SCALES.brand!)[900]).toBe(SEEDS.primary);
    expect(generateScale(SCALES.accent!)[400]).toBe(SEEDS.accent);
    const neutral = generateScale(SCALES.neutral!);
    expect(neutral[50]).toBe(SEEDS.surfaceLight);
    expect(neutral[900]).toBe(SEEDS.text);
    expect(neutral[950]).toBe(SEEDS.surfaceDark);
  });

  it('gets monotonically darker from 50 to 950', () => {
    for (const [name, spec] of Object.entries(SCALES)) {
      const lightness = STEPS.map((step) => rgbToOklch(hexToRgb(generateScale(spec)[step])).l);
      for (let i = 1; i < lightness.length; i++) {
        expect(lightness[i], `${name} step ${STEPS[i]}`).toBeLessThan(lightness[i - 1] as number);
      }
    }
  });

  it('is deterministic', () => {
    expect(generateScale(SCALES.danger!)).toEqual(generateScale(SCALES.danger!));
  });
});
