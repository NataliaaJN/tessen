import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { unmountAll } from './adapter.ts';

// jsdom lacks these; Zag (positioning, focus trap, dismissable) touches them.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;
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

afterEach(() => {
  unmountAll();
  document.body.removeAttribute('style');
  document.body.innerHTML = '';
  document.head.querySelectorAll('style[data-spike]').forEach((el) => el.remove());
});
