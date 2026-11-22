import * as presence from '@zag-js/presence';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface Item {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Renders into `document.body` after mount. Server and first client render produce nothing,
 * so hydration cannot mismatch; the content appears on the client only.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

/** Keeps content mounted until its exit animation has ended. */
export function usePresence(present: boolean) {
  const service = useMachine(presence.machine, { present });
  return presence.connect(service, normalizeProps);
}
