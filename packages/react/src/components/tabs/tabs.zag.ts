import { normalizeProps, useMachine } from '@zag-js/react';
import * as tabs from '@zag-js/tabs';
import { createContext, useCallback, useContext, useId, useState } from 'react';

/** Behavior adapter of Tabs: the only file of the component that talks to Zag (ADR 0004). */
type TabsApi = ReturnType<typeof tabs.connect>;

export interface TabsContextValue {
  api: TabsApi;
  /** Tabs report their value from an effect; the first one becomes the default selection. */
  registerTab(value: string): void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab, TabList and TabPanel must be used inside <Tabs>');
  return context;
}

export interface TabsRootOptions {
  value: string | undefined;
  defaultValue: string | undefined;
  orientation: 'horizontal' | 'vertical';
  activationMode: 'automatic' | 'manual';
  onValueChange: ((value: string) => void) | undefined;
}

/**
 * The selection is always handed to Zag as a controlled value: the parent's `value`, else what
 * the user last chose, else `defaultValue`, else the first tab.
 */
export function useTabsRoot(options: TabsRootOptions): TabsContextValue {
  const id = useId();
  const [chosen, setChosen] = useState<string>();
  const [first, setFirst] = useState<string>();
  const service = useMachine(tabs.machine, {
    id,
    value: options.value ?? chosen ?? options.defaultValue ?? first,
    orientation: options.orientation,
    activationMode: options.activationMode,
    onValueChange: (details) => {
      setChosen(details.value);
      options.onValueChange?.(details.value);
    },
  });
  const api = tabs.connect(service, normalizeProps);
  const registerTab = useCallback((value: string) => setFirst((current) => current ?? value), []);
  return { api, registerTab };
}
