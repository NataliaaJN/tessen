import * as popover from '@zag-js/popover';
import { normalizeProps, useMachine } from '@zag-js/react';
import { createContext, useContext, useId } from 'react';
import { usePresence } from '../../internal/presence.zag.ts';

/** Behavior adapter of Popover: the only file of the component that talks to Zag (ADR 0004). */
type PopoverApi = ReturnType<typeof popover.connect>;
type PresenceApi = ReturnType<typeof usePresence>;

export interface PopoverContextValue {
  api: PopoverApi;
  presence: PresenceApi;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopover(): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('Popover parts must be used inside <Popover>');
  return context;
}

export interface PopoverRootOptions {
  open: boolean | undefined;
  defaultOpen: boolean;
  placement: 'top' | 'bottom' | 'left' | 'right';
  closeOnEscape: boolean;
  closeOnInteractOutside: boolean;
  onOpenChange: ((open: boolean) => void) | undefined;
}

export function usePopoverRoot(options: PopoverRootOptions): PopoverContextValue {
  const id = useId();
  const service = useMachine(popover.machine, {
    id,
    open: options.open,
    defaultOpen: options.defaultOpen,
    closeOnEscape: options.closeOnEscape,
    closeOnInteractOutside: options.closeOnInteractOutside,
    positioning: { placement: options.placement },
    onOpenChange: (details) => options.onOpenChange?.(details.open),
  });
  const api = popover.connect(service, normalizeProps);
  return { api, presence: usePresence(api.open), placement: options.placement };
}
