import { normalizeProps, useMachine } from '@zag-js/react';
import * as tooltip from '@zag-js/tooltip';
import { createContext, useContext, useId } from 'react';
import { usePresence } from '../../internal/presence.zag.ts';

/** Behavior adapter of Tooltip: the only file of the component that talks to Zag (ADR 0004). */
type TooltipApi = ReturnType<typeof tooltip.connect>;
type PresenceApi = ReturnType<typeof usePresence>;

export interface TooltipContextValue {
  api: TooltipApi;
  presence: PresenceApi;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip(): TooltipContextValue {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('TooltipTrigger and TooltipContent must be used inside <Tooltip>');
  return context;
}

export interface TooltipRootOptions {
  openDelay: number;
  closeDelay: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
  disabled: boolean;
}

export function useTooltipRoot(options: TooltipRootOptions): TooltipContextValue {
  const id = useId();
  const service = useMachine(tooltip.machine, {
    id,
    openDelay: options.openDelay,
    closeDelay: options.closeDelay,
    disabled: options.disabled,
    positioning: { placement: options.placement },
  });
  const api = tooltip.connect(service, normalizeProps);
  const presence = usePresence(api.open);
  return { api, presence, placement: options.placement };
}
