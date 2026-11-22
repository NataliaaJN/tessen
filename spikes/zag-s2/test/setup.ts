import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { unmountAll } from './adapter.ts';

// jsdom lacks these; Zag (positioning, focus trap, dismissable) touches them.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== 'undefined') globalThis.ResizeObserver ??= ResizeObserverStub;
if (typeof window !== 'undefined')
  globalThis.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof matchMedia;
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView ??= () => {};

afterEach(() => {
  unmountAll();
  if (typeof document === 'undefined') return;
  document.body.removeAttribute('style');
  document.body.innerHTML = '';
});
