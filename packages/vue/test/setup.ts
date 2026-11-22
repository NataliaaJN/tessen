import { afterEach } from 'vitest';

// Adapters unmount explicitly; this only guarantees a clean body for the next case.
afterEach(() => {
  document.body.innerHTML = '';
});
