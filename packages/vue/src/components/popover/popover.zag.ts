import * as popover from '@zag-js/popover';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, inject, provide, useId, type ComputedRef, type InjectionKey } from 'vue';
import { usePresence } from '../../internal/presence.zag.js';

/** Behavior adapter of Popover: the only file of the component that talks to Zag (ADR 0004). */
type PopoverApi = ReturnType<typeof popover.connect>;
type PresenceApi = ReturnType<typeof usePresence>;

interface PopoverContext {
  api: ComputedRef<PopoverApi>;
  presence: PresenceApi;
  placement: ComputedRef<'top' | 'bottom' | 'left' | 'right'>;
}

const key: InjectionKey<PopoverContext> = Symbol('tessen-popover');

export interface PopoverRootOptions {
  open: () => boolean | undefined;
  defaultOpen: () => boolean;
  placement: () => 'top' | 'bottom' | 'left' | 'right';
  closeOnEscape: () => boolean;
  closeOnInteractOutside: () => boolean;
  onOpenChange: (open: boolean) => void;
}

export function providePopover(options: PopoverRootOptions): void {
  const id = useId();
  const service = useMachine(
    popover.machine,
    computed(() => ({
      id,
      open: options.open(),
      defaultOpen: options.defaultOpen(),
      closeOnEscape: options.closeOnEscape(),
      closeOnInteractOutside: options.closeOnInteractOutside(),
      positioning: { placement: options.placement() },
      onOpenChange: (details: { open: boolean }) => options.onOpenChange(details.open),
    })),
  );
  const api = computed(() => popover.connect(service, normalizeProps));
  provide(key, {
    api,
    presence: usePresence(computed(() => api.value.open)),
    placement: computed(() => options.placement()),
  });
}

export function usePopover(): PopoverContext {
  const context = inject(key);
  if (!context) throw new Error('Popover parts must be used inside <TPopover>');
  return context;
}
