import { afterEach } from 'vitest';

// jsdom lacks these; Zag (positioning, focus trap, dismissable layers) touches them.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;
Element.prototype.scrollTo ??= function scrollTo() {};
Element.prototype.scrollIntoView ??= function scrollIntoView() {};
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

// Adapters unmount explicitly; this only guarantees a clean body for the next case.
afterEach(() => {
  document.body.removeAttribute('style');
  document.body.innerHTML = '';
});
