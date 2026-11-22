/** What a framework provides for the shared suite. The suite never imports Vue or React. */
export interface Handle {
  container: HTMLElement;
  unmount(): void;
}

export type Kind =
  | 'select'
  | 'combobox'
  | 'menu'
  | 'popover'
  | 'dialog'
  | 'tooltip'
  | 'datepicker'
  /** A Dialog whose content is a Select: portal inside portal. */
  | 'nested';

/**
 * Neutral props. Adapters map them to each framework's idiom:
 * `value` + `onValueChange` (React) or `modelValue` + `update:modelValue` (Vue),
 * `open` + `onOpenChange` or `update:open`, `onSelect` or `select`.
 */
export type Props = Record<string, unknown>;

export interface Adapter {
  name: string;
  mount(kind: Kind, props?: Props): Handle;
  /** Server-render, hydrate in the DOM, and report every console warning/error. */
  hydrate(kind: Kind, props?: Props): Promise<Handle & { messages: string[] }>;
}

export const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

export const ACTIONS = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate', disabled: true },
  { value: 'delete', label: 'Delete' },
];

const mounted = new Set<Handle>();

/** Handles are unmounted after each test: modal layers leave global state behind. */
export function track<T extends Handle>(handle: T): T {
  mounted.add(handle);
  return handle;
}

export function unmountAll() {
  for (const handle of mounted) handle.unmount();
  mounted.clear();
}
