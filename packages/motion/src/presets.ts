/**
 * Motion presets as data. One definition feeds the generated CSS `@keyframes` (level 0) and,
 * in F2, the Web Animations runtime (level 1), so the two cannot diverge.
 * Values reference CSS variables from `@tessen-ui/tokens`; nothing here is a literal `ms`.
 */

export type DurationToken = 'fast' | 'normal' | 'slow' | 'slower';
export type EasingToken = 'standard' | 'decelerate' | 'accelerate' | 'emphasized';

/** What `data-tessen-motion="reduced"` does to a preset. */
export type ReducedBehavior =
  /** Fade instead (no displacement, scale or rotation). */
  | 'fade'
  /** No animation. */
  | 'none'
  /** Unchanged: it never moves or scales. */
  | 'keep';

export interface Preset {
  /** CSS declarations of the `from` and `to` keyframes. */
  from: Readonly<Record<string, string>>;
  to: Readonly<Record<string, string>>;
  duration: DurationToken;
  easing: EasingToken;
  reduced: ReducedBehavior;
  /** Direction of a paired preset; picks the fade used under `reduced`. */
  phase: 'in' | 'out';
  /** `animation-iteration-count`. Defaults to 1. */
  iterations?: number;
}

const distance = (axis: 'X' | 'Y', sign: '' | '-') =>
  `translate${axis}(${sign === '-' ? '-' : ''}var(--tessen-motion-distance-sm))`;

/** A slide moves toward `direction`: it enters from the opposite side and leaves toward it. */
function slide(axis: 'X' | 'Y', direction: 1 | -1) {
  // direction 1 = toward positive axis (down / right). Entering comes from the opposite side.
  const fromSide = direction === 1 ? '-' : '';
  const toSide = direction === 1 ? '' : '-';
  return {
    in: {
      from: { opacity: '0', transform: distance(axis, fromSide) },
      to: { opacity: '1', transform: 'none' },
      duration: 'normal',
      easing: 'decelerate',
      reduced: 'fade',
      phase: 'in',
    },
    out: {
      from: { opacity: '1', transform: 'none' },
      to: { opacity: '0', transform: distance(axis, toSide) },
      duration: 'fast',
      easing: 'accelerate',
      reduced: 'fade',
      phase: 'out',
    },
  } satisfies Record<'in' | 'out', Preset>;
}

const up = slide('Y', -1);
const down = slide('Y', 1);
const left = slide('X', -1);
const right = slide('X', 1);

export const presets = {
  'fade-in': {
    from: { opacity: '0' },
    to: { opacity: '1' },
    duration: 'normal',
    easing: 'decelerate',
    reduced: 'keep',
    phase: 'in',
  },
  'fade-out': {
    from: { opacity: '1' },
    to: { opacity: '0' },
    duration: 'fast',
    easing: 'accelerate',
    reduced: 'keep',
    phase: 'out',
  },
  'slide-up-in': up.in,
  'slide-up-out': up.out,
  'slide-down-in': down.in,
  'slide-down-out': down.out,
  'slide-left-in': left.in,
  'slide-left-out': left.out,
  'slide-right-in': right.in,
  'slide-right-out': right.out,
  'scale-in': {
    from: { opacity: '0', transform: 'scale(0.98)' },
    to: { opacity: '1', transform: 'none' },
    duration: 'normal',
    easing: 'decelerate',
    reduced: 'fade',
    phase: 'in',
  },
  'scale-out': {
    from: { opacity: '1', transform: 'none' },
    to: { opacity: '0', transform: 'scale(0.98)' },
    duration: 'fast',
    easing: 'accelerate',
    reduced: 'fade',
    phase: 'out',
  },
  'pop-in': {
    from: { opacity: '0', transform: 'scale(0.9)' },
    to: { opacity: '1', transform: 'none' },
    duration: 'normal',
    easing: 'emphasized',
    reduced: 'fade',
    phase: 'in',
  },
  'collapse-in': {
    from: { 'grid-template-rows': '0fr' },
    to: { 'grid-template-rows': '1fr' },
    duration: 'normal',
    easing: 'standard',
    reduced: 'keep',
    phase: 'in',
  },
  'collapse-out': {
    from: { 'grid-template-rows': '1fr' },
    to: { 'grid-template-rows': '0fr' },
    duration: 'fast',
    easing: 'standard',
    reduced: 'keep',
    phase: 'out',
  },
  shake: {
    from: { transform: 'translateX(0)' },
    to: { transform: 'translateX(var(--tessen-motion-distance-xs))' },
    duration: 'fast',
    easing: 'standard',
    reduced: 'none',
    phase: 'in',
    iterations: 6,
  },
} as const satisfies Record<string, Preset>;

export type PresetName = keyof typeof presets;
