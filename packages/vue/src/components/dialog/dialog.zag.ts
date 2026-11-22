import * as dialog from '@zag-js/dialog';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, inject, provide, useId, type ComputedRef, type InjectionKey } from 'vue';
import { usePresence } from '../../internal/presence.zag.js';

/** Behavior adapter of Dialog: the only file of the component that talks to Zag (ADR 0004). */
type DialogApi = ReturnType<typeof dialog.connect>;
type PresenceApi = ReturnType<typeof usePresence>;

interface DialogContext {
  api: ComputedRef<DialogApi>;
  presence: PresenceApi;
}

const key: InjectionKey<DialogContext> = Symbol('tessen-dialog');

export interface DialogRootOptions {
  open: () => boolean | undefined;
  defaultOpen: () => boolean;
  modal: () => boolean;
  role: () => 'dialog' | 'alertdialog';
  closeOnEscape: () => boolean;
  closeOnInteractOutside: () => boolean | undefined;
  onOpenChange: (open: boolean) => void;
}

export function provideDialog(options: DialogRootOptions): void {
  const id = useId();
  const service = useMachine(
    dialog.machine,
    computed(() => ({
      id,
      open: options.open(),
      defaultOpen: options.defaultOpen(),
      modal: options.modal(),
      role: options.role(),
      closeOnEscape: options.closeOnEscape(),
      // An alertdialog asks for a decision: a stray click outside must not dismiss it.
      closeOnInteractOutside: options.closeOnInteractOutside() ?? options.role() !== 'alertdialog',
      onOpenChange: (details: { open: boolean }) => options.onOpenChange(details.open),
    })),
  );
  const api = computed(() => dialog.connect(service, normalizeProps));
  provide(key, { api, presence: usePresence(computed(() => api.value.open)) });
}

export function useDialog(): DialogContext {
  const context = inject(key);
  if (!context) throw new Error('Dialog parts must be used inside <TDialog>');
  return context;
}
