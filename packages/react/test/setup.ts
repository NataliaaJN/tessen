import { afterEach } from 'vitest';

// jsdom lacks these; Zag (positioning, focus trap, dismissable layers) touches them.
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

// React Testing Library only auto-cleans when a global `afterEach` exists; adapters unmount
// explicitly, this just guarantees a clean body for the next case.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  document.body.removeAttribute('style');
  document.body.innerHTML = '';
});
