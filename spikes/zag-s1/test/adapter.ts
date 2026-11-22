/** What a framework must provide for the shared behavior suite. The suite never imports Vue or React. */
export interface Handle {
  container: HTMLElement;
  unmount(): void;
}

export interface DialogOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  description?: string;
}

export interface TabsOptions {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface TooltipOptions {
  openDelay?: number;
}

export type Kind = 'dialog' | 'tabs' | 'tooltip';

export interface Adapter {
  name: string;
  dialog(options?: DialogOptions): Handle;
  tabs(options?: TabsOptions): Handle;
  tooltip(options?: TooltipOptions): Handle;
  /** Server-render `kind`, hydrate it in the DOM and report every console warning/error. */
  hydrate(kind: Kind): Promise<Handle & { messages: string[] }>;
}

export const TAB_ITEMS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta', disabled: true },
  { value: 'gamma', label: 'Gamma' },
] as const;

const mounted = new Set<Handle>();

/** Registers a handle so `setup.ts` can unmount it after the test (modal dialogs leave global state behind). */
export function track<T extends Handle>(handle: T): T {
  mounted.add(handle);
  return handle;
}

export function unmountAll() {
  for (const handle of mounted) handle.unmount();
  mounted.clear();
}
