export { presets } from './presets.ts';
export type { DurationToken, EasingToken, Preset, PresetName, ReducedBehavior } from './presets.ts';

/** Values of `data-tessen-motion`. Without the attribute, `prefers-reduced-motion` decides. */
export const motionModes = ['off', 'reduced', 'full'] as const;
export type MotionMode = (typeof motionModes)[number];

/** CSS custom property holding the `animation` shorthand of a preset. */
export const presetVariable = (name: string): `--tessen-motion-preset-${string}` =>
  `--tessen-motion-preset-${name}`;
