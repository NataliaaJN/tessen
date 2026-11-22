import * as dialog from '@zag-js/dialog';
import { normalizeProps, useMachine } from '@zag-js/react';
import { createContext, useContext, useId } from 'react';
import { usePresence } from './presence.zag.ts';

/** Behavior adapter of Dialog: the only file of the component that talks to Zag (ADR 0004). */
type DialogApi = ReturnType<typeof dialog.connect>;
type PresenceApi = ReturnType<typeof usePresence>;

export interface DialogContextValue {
  api: DialogApi;
  presence: PresenceApi;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) throw new Error('Dialog parts must be used inside <Dialog>');
  return context;
}

export interface DialogRootOptions {
  open: boolean | undefined;
  defaultOpen: boolean;
  modal: boolean;
  role: 'dialog' | 'alertdialog';
  closeOnEscape: boolean;
  closeOnInteractOutside: boolean | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
}

export function useDialogRoot(options: DialogRootOptions): DialogContextValue {
  const id = useId();
  const service = useMachine(dialog.machine, {
    id,
    open: options.open,
    defaultOpen: options.defaultOpen,
    modal: options.modal,
    role: options.role,
    closeOnEscape: options.closeOnEscape,
    // An alertdialog asks for a decision: a stray click outside must not dismiss it.
    closeOnInteractOutside: options.closeOnInteractOutside ?? options.role !== 'alertdialog',
    onOpenChange: (details) => options.onOpenChange?.(details.open),
  });
  const api = dialog.connect(service, normalizeProps);
  return { api, presence: usePresence(api.open) };
}
