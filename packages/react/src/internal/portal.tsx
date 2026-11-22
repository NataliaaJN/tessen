'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const subscribe = () => () => {};

/**
 * Renders into `document.body`. The server and the hydration pass render nothing (they agree);
 * a plain client render portals right away, so the content already exists in the commit where
 * the behavior engine starts. With a `useEffect` mount instead, a component that starts open
 * (`defaultOpen`) ran its focus trap and listeners before its content was in the DOM and they
 * never attached (found by the real-browser tests).
 */
export function Portal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return mounted ? createPortal(children, document.body) : null;
}
