/**
 * Motion level 1: a small Web Animations runtime over the same presets as the CSS (level 0).
 * No framework imports; every function degrades to "no animation" where the browser or the
 * user's settings say so, and never throws for a missing API.
 */
import { motionModes, type MotionMode } from './modes.ts';
import { presets, type PresetName } from './presets.ts';

const ATTRIBUTE = 'data-tessen-motion';
const OVERRIDE = 'data-tessen-motion-override';

const isMode = (value: string | null): value is MotionMode =>
  motionModes.includes(value as MotionMode);

/**
 * The mode that applies to `element`: the nearest `data-tessen-motion` wins; without one (or with
 * `full` and no `data-tessen-motion-override`) the operating system's reduced-motion preference decides.
 */
export function resolveMotionMode(element: Element = document.documentElement): MotionMode {
  const holder = element.closest(`[${ATTRIBUTE}]`);
  const explicit = holder?.getAttribute(ATTRIBUTE) ?? null;
  const prefersReduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isMode(explicit)) {
    if (explicit === 'full') {
      return prefersReduced && !holder?.hasAttribute(OVERRIDE) ? 'reduced' : 'full';
    }
    return explicit;
  }
  return prefersReduced ? 'reduced' : 'full';
}

/** Global control: sets (or, with `null`, clears) the mode on the root element. */
export function setMotionMode(
  mode: MotionMode | null,
  root: Element = document.documentElement,
): void {
  if (mode === null) root.removeAttribute(ATTRIBUTE);
  else root.setAttribute(ATTRIBUTE, mode);
}

/** Reads a motion token (`--tessen-motion-duration-fast`...) as resolved on `element`. */
function token(element: Element, name: string): string {
  return getComputedStyle(element).getPropertyValue(name).trim();
}

/** `120ms` / `0.12s` -> milliseconds. Falls back to `fallback` for anything else. */
export function parseDuration(value: string, fallback = 0): number {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
  if (!match) return fallback;
  return match[2] === 's' ? Number(match[1]) * 1000 : Number(match[1]);
}

export interface AnimateOptions {
  /** Milliseconds; overrides the preset's duration token. */
  duration?: number;
  delay?: number;
  fill?: FillMode;
}

/**
 * Plays a preset on `element` with the Web Animations API and returns the `Animation`, or `null`
 * when nothing plays (mode `off`, the preset has `reduced: 'none'` under `reduced`, or no WAAPI).
 */
export function animate(
  element: HTMLElement,
  name: PresetName,
  options: AnimateOptions = {},
): Animation | null {
  if (typeof element.animate !== 'function') return null;
  const mode = resolveMotionMode(element);
  if (mode === 'off') return null;
  const preset = presets[name];
  if (mode === 'reduced' && preset.reduced === 'none') return null;

  const fadeOnly = mode === 'reduced' && preset.reduced === 'fade';
  const keyframes = fadeOnly
    ? [
        { opacity: preset.phase === 'in' ? '0' : '1' },
        { opacity: preset.phase === 'in' ? '1' : '0' },
      ]
    : [{ ...preset.from }, { ...preset.to }];

  let duration =
    options.duration ??
    parseDuration(token(element, `--tessen-motion-duration-${preset.duration}`));
  if (mode === 'reduced' && options.duration === undefined) {
    // Reduced motion caps every duration to `fast`.
    duration = Math.min(
      duration,
      parseDuration(token(element, '--tessen-motion-duration-fast'), duration),
    );
  }
  const easing = token(element, `--tessen-motion-easing-${preset.easing}`) || 'ease';
  return element.animate(keyframes, {
    duration,
    delay: options.delay ?? 0,
    easing,
    fill: options.fill ?? 'both',
    iterations: 'iterations' in preset ? preset.iterations : 1,
  });
}

/**
 * Presence: resolves once every animation running on `element` (and its descendants) has ended,
 * so a component can unmount after its exit. Resolves at once without WAAPI or running animations.
 */
export async function presence(element: Element): Promise<void> {
  if (typeof element.getAnimations !== 'function') return;
  await Promise.allSettled(element.getAnimations({ subtree: true }).map((a) => a.finished));
}

/** Delay in ms of the `index`-th item of a staggered group, capped at `max` items. */
export function stagger(index: number, step = 40, max = 8): number {
  return Math.min(Math.max(index, 0), max) * step;
}
