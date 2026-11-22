import * as presence from '@zag-js/presence';
import { normalizeProps, useMachine } from '@zag-js/react';

/** Keeps content mounted until its exit animation has ended (criterion 6). */
export function usePresence(present: boolean) {
  const service = useMachine(presence.machine, { present });
  return presence.connect(service, normalizeProps);
}
