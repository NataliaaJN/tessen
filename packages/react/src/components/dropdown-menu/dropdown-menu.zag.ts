import * as menu from '@zag-js/menu';
import { normalizeProps, useMachine } from '@zag-js/react';
import { createContext, useContext, useId } from 'react';
import { usePresence } from '../../internal/presence.zag.ts';

/** Behavior adapter of DropdownMenu: the only file of the component that talks to Zag (ADR 0004). */
type MenuApi = ReturnType<typeof menu.connect>;
type PresenceApi = ReturnType<typeof usePresence>;

export interface DropdownMenuContextValue {
  api: MenuApi;
  presence: PresenceApi;
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenu(): DropdownMenuContextValue {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenu parts must be used inside <DropdownMenu>');
  return context;
}

export interface DropdownMenuRootOptions {
  open: boolean | undefined;
  defaultOpen: boolean;
  placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  onSelect: ((value: string) => void) | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
}

export function useDropdownMenuRoot(options: DropdownMenuRootOptions): DropdownMenuContextValue {
  const id = useId();
  const service = useMachine(menu.machine, {
    id,
    open: options.open,
    defaultOpen: options.defaultOpen,
    positioning: { placement: options.placement },
    onSelect: (details) => options.onSelect?.(details.value),
    onOpenChange: (details) => options.onOpenChange?.(details.open),
  });
  const api = menu.connect(service, normalizeProps);
  return { api, presence: usePresence(api.open) };
}
