import * as tooltip from '@zag-js/tooltip';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, inject, provide, useId, type ComputedRef, type InjectionKey } from 'vue';
import { usePresence } from '../../internal/presence.zag.js';

/** Behavior adapter of Tooltip: the only file of the component that talks to Zag (ADR 0004). */
type TooltipApi = ReturnType<typeof tooltip.connect>;
type PresenceApi = ReturnType<typeof usePresence>;

interface TooltipContext {
  api: ComputedRef<TooltipApi>;
  presence: PresenceApi;
  placement: ComputedRef<string>;
}

const key: InjectionKey<TooltipContext> = Symbol('tessen-tooltip');

export interface TooltipRootOptions {
  openDelay: () => number;
  closeDelay: () => number;
  placement: () => 'top' | 'bottom' | 'left' | 'right';
  disabled: () => boolean;
}

export function provideTooltip(options: TooltipRootOptions): void {
  const id = useId();
  const service = useMachine(
    tooltip.machine,
    computed(() => ({
      id,
      openDelay: options.openDelay(),
      closeDelay: options.closeDelay(),
      disabled: options.disabled(),
      positioning: { placement: options.placement() },
    })),
  );
  const api = computed(() => tooltip.connect(service, normalizeProps));
  provide(key, {
    api,
    presence: usePresence(computed(() => api.value.open)),
    placement: computed(() => options.placement()),
  });
}

export function useTooltip(): TooltipContext {
  const context = inject(key);
  if (!context) throw new Error('TooltipTrigger and TooltipContent must be used inside <TTooltip>');
  return context;
}
