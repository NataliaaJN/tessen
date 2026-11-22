// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  animate,
  parseDuration,
  presence,
  resolveMotionMode,
  setMotionMode,
  stagger,
} from '../src/index.ts';

function prefersReduced(value: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: value && query.includes('reduce'),
    media: query,
  }));
}

/** An element whose `animate` is a spy and whose motion tokens resolve like the real CSS. */
function target() {
  const el = document.createElement('div');
  document.body.append(el);
  document.documentElement.style.setProperty('--tessen-motion-duration-normal', '200ms');
  document.documentElement.style.setProperty('--tessen-motion-duration-fast', '120ms');
  document.documentElement.style.setProperty('--tessen-motion-easing-decelerate', 'ease-out');
  document.documentElement.style.setProperty('--tessen-motion-easing-accelerate', 'ease-in');
  const spy = vi.fn(() => ({}) as Animation);
  el.animate = spy as unknown as HTMLElement['animate'];
  return { el, spy };
}

beforeEach(() => prefersReduced(false));
afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-tessen-motion');
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
});

describe('resolveMotionMode / setMotionMode', () => {
  it('is full without attribute or OS preference', () => {
    expect(resolveMotionMode()).toBe('full');
  });
  it('follows prefers-reduced-motion when there is no attribute', () => {
    prefersReduced(true);
    expect(resolveMotionMode()).toBe('reduced');
  });
  it('uses the nearest attribute and lets the OS preference win over plain full', () => {
    const { el } = target();
    setMotionMode('off');
    expect(resolveMotionMode(el)).toBe('off');
    setMotionMode('full');
    prefersReduced(true);
    expect(resolveMotionMode(el)).toBe('reduced');
    document.documentElement.setAttribute('data-tessen-motion-override', '');
    expect(resolveMotionMode(el)).toBe('full');
    document.documentElement.removeAttribute('data-tessen-motion-override');
  });
  it('clears the attribute with null', () => {
    setMotionMode('reduced');
    setMotionMode(null);
    expect(document.documentElement.hasAttribute('data-tessen-motion')).toBe(false);
  });
});

describe('animate', () => {
  it('plays the preset with the token duration and easing', () => {
    const { el, spy } = target();
    animate(el, 'fade-in');
    expect(spy).toHaveBeenCalledWith(
      [{ opacity: '0' }, { opacity: '1' }],
      expect.objectContaining({ duration: 200, easing: 'ease-out', iterations: 1 }),
    );
  });
  it('plays nothing when the mode is off or WAAPI is missing', () => {
    const { el, spy } = target();
    setMotionMode('off');
    expect(animate(el, 'fade-in')).toBeNull();
    expect(spy).not.toHaveBeenCalled();
    const bare = document.createElement('div');
    setMotionMode(null);
    expect(animate(bare, 'fade-in')).toBeNull();
  });
  it('turns slides into a fade and caps the duration under reduced', () => {
    const { el, spy } = target();
    setMotionMode('reduced');
    animate(el, 'slide-up-in');
    expect(spy).toHaveBeenCalledWith(
      [{ opacity: '0' }, { opacity: '1' }],
      expect.objectContaining({ duration: 120 }),
    );
  });
  it('drops presets that never reduce (shake) under reduced', () => {
    const { el } = target();
    setMotionMode('reduced');
    expect(animate(el, 'shake')).toBeNull();
  });
  it('lets the caller choose the duration', () => {
    const { el, spy } = target();
    animate(el, 'scale-in', { duration: 50 });
    expect(spy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: 50 }));
  });
});

describe('presence, stagger, parseDuration', () => {
  it('presence resolves at once without running animations', async () => {
    const el = document.createElement('div');
    await expect(presence(el)).resolves.toBeUndefined();
    el.getAnimations = (() => [
      { finished: Promise.resolve() },
    ]) as unknown as Element['getAnimations'];
    await expect(presence(el)).resolves.toBeUndefined();
  });
  it('stagger steps and caps', () => {
    expect([0, 1, 3, 20].map((i) => stagger(i))).toEqual([0, 40, 120, 320]);
    expect(stagger(-2)).toBe(0);
  });
  it('parseDuration reads ms and s', () => {
    expect(parseDuration('120ms')).toBe(120);
    expect(parseDuration('0.2s')).toBe(200);
    expect(parseDuration('nope', 7)).toBe(7);
  });
});
