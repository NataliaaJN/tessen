import * as tabs from '@zag-js/tabs';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, inject, provide, ref, useId, type ComputedRef, type InjectionKey } from 'vue';

/** Behavior adapter of Tabs: the only file of the component that talks to Zag (ADR 0004). */
type TabsApi = ReturnType<typeof tabs.connect>;

interface TabsContext {
  api: ComputedRef<TabsApi>;
  /** Tabs report their value while rendering; the first one becomes the default selection. */
  registerTab(value: string): void;
}

const key: InjectionKey<TabsContext> = Symbol('tessen-tabs');

export interface TabsRootOptions {
  value: () => string | undefined;
  defaultValue: () => string | undefined;
  orientation: () => 'horizontal' | 'vertical';
  activationMode: () => 'automatic' | 'manual';
  onValueChange: (value: string) => void;
}

/**
 * The selection is always handed to Zag as a controlled value: the parent's `value`, else what
 * the user last chose, else `defaultValue`, else the first tab. That keeps "first tab by default"
 * synchronous (and SSR-safe) without asking Zag to change its mind after it started.
 */
export function provideTabs(options: TabsRootOptions): ComputedRef<TabsApi> {
  const id = useId();
  const chosen = ref<string>();
  const first = ref<string>();
  const current = computed(
    () => options.value() ?? chosen.value ?? options.defaultValue() ?? first.value,
  );
  const service = useMachine(
    tabs.machine,
    computed(() => ({
      id,
      value: current.value,
      orientation: options.orientation(),
      activationMode: options.activationMode(),
      onValueChange: (details: { value: string }) => {
        chosen.value = details.value;
        options.onValueChange(details.value);
      },
    })),
  );
  const api = computed(() => tabs.connect(service, normalizeProps));

  provide(key, {
    api,
    registerTab: (value) => (first.value ??= value),
  });
  return api;
}

export function useTabs(): TabsContext {
  const context = inject(key);
  if (!context) throw new Error('Tab, TabList and TabPanel must be used inside <TTabs>');
  return context;
}
