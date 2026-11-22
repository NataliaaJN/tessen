import * as presence from '@zag-js/presence';
import { normalizeProps, useMachine } from '@zag-js/react';

/** Keeps content mounted until its exit animation has ended (no component-level timers). */
export function usePresence(present: boolean) {
  const service = useMachine(presence.machine, { present });
  return presence.connect(service, normalizeProps);
}
