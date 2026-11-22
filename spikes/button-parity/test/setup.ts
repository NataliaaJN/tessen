import { afterEach } from 'vitest';

// React Testing Library only auto-cleans when a global `afterEach` exists; adapters unmount explicitly,
// this just guarantees a clean body for the next case.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  document.body.innerHTML = '';
});
