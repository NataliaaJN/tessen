import * as menu from '@zag-js/menu';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, inject, provide, useId, type ComputedRef, type InjectionKey } from 'vue';
import { usePresence } from '../../internal/presence.zag.js';

/** Behavior adapter of DropdownMenu: the only file of the component that talks to Zag (ADR 0004). */
type MenuApi = ReturnType<typeof menu.connect>;
type PresenceApi = ReturnType<typeof usePresence>;

interface DropdownMenuContext {
  api: ComputedRef<MenuApi>;
  presence: PresenceApi;
}

const key: InjectionKey<DropdownMenuContext> = Symbol('tessen-dropdown-menu');

export interface DropdownMenuRootOptions {
  open: () => boolean | undefined;
  defaultOpen: () => boolean;
  placement: () => 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  onSelect: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function provideDropdownMenu(options: DropdownMenuRootOptions): void {
  const id = useId();
  const service = useMachine(
    menu.machine,
    computed(() => ({
      id,
      open: options.open(),
      defaultOpen: options.defaultOpen(),
      positioning: { placement: options.placement() },
      onSelect: (details: { value: string }) => options.onSelect(details.value),
      onOpenChange: (details: { open: boolean }) => options.onOpenChange(details.open),
    })),
  );
  const api = computed(() => menu.connect(service, normalizeProps));
  provide(key, { api, presence: usePresence(computed(() => api.value.open)) });
}

export function useDropdownMenu(): DropdownMenuContext {
  const context = inject(key);
  if (!context) throw new Error('DropdownMenu parts must be used inside <TDropdownMenu>');
  return context;
}
