export { presets } from './presets.ts';
export type { DurationToken, EasingToken, Preset, PresetName, ReducedBehavior } from './presets.ts';

export { motionModes } from './modes.ts';
export type { MotionMode } from './modes.ts';

/** CSS custom property holding the `animation` shorthand of a preset. */
export const presetVariable = (name: string): `--tessen-motion-preset-${string}` =>
  `--tessen-motion-preset-${name}`;

export {
  animate,
  parseDuration,
  presence,
  resolveMotionMode,
  setMotionMode,
  stagger,
} from './runtime.ts';
export type { AnimateOptions } from './runtime.ts';
