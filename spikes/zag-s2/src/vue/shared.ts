import * as presence from '@zag-js/presence';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, onMounted, ref, Teleport, type Ref } from 'vue';

export interface Item {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Teleports into `document.body` after mount. Server and first client render produce nothing,
 * so hydration cannot mismatch (and Nuxt needs no teleport target); content appears on the client.
 */
export const Portal = defineComponent({
  name: 'TPortal',
  setup(_, { slots }) {
    const mounted = ref(false);
    onMounted(() => (mounted.value = true));
    return () => (mounted.value ? h(Teleport, { to: 'body' }, [slots.default?.()]) : null);
  },
});

/** Keeps content mounted until its exit animation has ended. */
export function usePresence(present: Ref<boolean>) {
  const service = useMachine(
    presence.machine,
    computed(() => ({ present: present.value })),
  );
  return computed(() => presence.connect(service, normalizeProps));
}

/** Maps the public `value` prop (`undefined` = uncontrolled, `null` = empty) to a machine value. */
export const toValues = (value: string | null | undefined) =>
  value === undefined ? undefined : value === null ? [] : [value];
