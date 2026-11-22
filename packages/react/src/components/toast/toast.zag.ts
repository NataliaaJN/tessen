import { normalizeProps, useMachine } from '@zag-js/react';
import * as toast from '@zag-js/toast';
import { useId } from 'react';

/** Behavior adapter of Toast: the only file of the component that talks to Zag (ADR 0004). */
export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading';
export type ToastPlacement =
  'top-start' | 'top' | 'top-end' | 'bottom-start' | 'bottom' | 'bottom-end';

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  /** Milliseconds on screen. `Infinity` keeps it until it is dismissed. Hover and focus pause it. */
  duration?: number;
  /** Shows a close button. Default `true`. */
  closable?: boolean;
  /** An optional button next to the text (e.g. "Undo"). */
  action?: { label: string; onClick: () => void };
  /** Reuse an id to replace a toast instead of stacking another. */
  id?: string;
}

/** The handle created once (`createToaster`) and used from anywhere to show toasts. */
export interface Toaster {
  create(options: ToastOptions): string;
  success(options: ToastOptions): void;
  error(options: ToastOptions): void;
  info(options: ToastOptions): void;
  warning(options: ToastOptions): void;
  loading(options: ToastOptions): void;
  update(id: string, options: ToastOptions): void;
  /** Closes with the exit animation. Without an id, closes all. */
  dismiss(id?: string): void;
  /** Removes at once, no animation. Without an id, removes all. */
  remove(id?: string): void;
}

export interface ToasterOptions {
  placement?: ToastPlacement;
  /** How many toasts are visible at once (the rest wait in a queue). */
  max?: number;
  /** Default duration in milliseconds. */
  duration?: number;
}

const stores = new WeakMap<Toaster, toast.Store>();

function withClosable(options: ToastOptions): ToastOptions {
  return { closable: true, ...options };
}

export function createToaster(options: ToasterOptions = {}): Toaster {
  const store = toast.createStore({ placement: 'bottom-end', max: 5, ...options });
  const toaster: Toaster = {
    create: (o) => store.create(withClosable(o)),
    success: (o) => store.success(withClosable(o)),
    error: (o) => store.error(withClosable(o)),
    info: (o) => store.info(withClosable(o)),
    warning: (o) => store.warning(withClosable(o)),
    loading: (o) => store.loading(withClosable(o)),
    update: (id, o) => void store.update(id, o),
    dismiss: (id) => store.dismiss(id),
    remove: (id) => store.remove(id),
  };
  stores.set(toaster, store);
  return toaster;
}

export function useToasterRoot(toaster: Toaster): {
  service: toast.GroupService;
  api: toast.GroupApi;
} {
  const store = stores.get(toaster);
  if (!store) throw new Error('<Toaster toaster> needs a value made with createToaster()');
  const id = useId();
  const service = useMachine(toast.group.machine, { id, store });
  return { service, api: toast.group.connect(service, normalizeProps) };
}

export function useToastItem(
  props: toast.Props,
  parent: toast.GroupService,
  index: number,
): toast.Api {
  const service = useMachine(toast.machine, { ...props, parent, index });
  return toast.connect(service, normalizeProps);
}

export type { GroupService, Props as ToastItemProps } from '@zag-js/toast';
