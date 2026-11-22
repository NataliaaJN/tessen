import * as presence from '@zag-js/presence';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, type Ref } from 'vue';

/** Keeps content mounted until its exit animation has ended (no component-level timers). */
export function usePresence(present: Ref<boolean>) {
  const service = useMachine(
    presence.machine,
    computed(() => ({ present: present.value })),
  );
  return computed(() => presence.connect(service, normalizeProps));
}
