import { filterItems } from '@tessen-ui/core/contracts/combobox';
import type { SelectItem } from '@tessen-ui/core/contracts/select';
import * as combobox from '@zag-js/combobox';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId, useMemo, useState } from 'react';

/** Behavior adapter of Combobox: the only file of the component that talks to Zag (ADR 0004). */
export interface ComboboxRootOptions {
  items: readonly SelectItem[];
  /** `undefined`: uncontrolled. `null`: controlled with nothing selected. */
  value: string | null | undefined;
  defaultValue: string | undefined;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  disabled: boolean | undefined;
  placeholder: string | undefined;
  onValueChange: ((value: string | null) => void) | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
}

export function useComboboxRoot(options: ComboboxRootOptions) {
  const id = useId();
  // Filtering is TESSEN's job: the machine only renders the collection it is given. Only what
  // the person types narrows the list: choosing an option fills the input but must not hide
  // the other options the next time the list opens.
  const [query, setQuery] = useState('');
  const visible = useMemo(() => filterItems(options.items, query), [options.items, query]);
  const collection = useMemo(() => combobox.collection({ items: visible }), [visible]);
  const service = useMachine(combobox.machine, {
    id,
    collection,
    value: options.value === undefined ? undefined : options.value === null ? [] : [options.value],
    defaultValue: options.defaultValue === undefined ? undefined : [options.defaultValue],
    open: options.open,
    defaultOpen: options.defaultOpen,
    disabled: options.disabled,
    placeholder: options.placeholder,
    positioning: { sameWidth: true },
    onInputValueChange: (details) =>
      setQuery(details.reason === 'input-change' ? details.inputValue : ''),
    onValueChange: (details) => options.onValueChange?.(details.value[0] ?? null),
    onOpenChange: (details) => options.onOpenChange?.(details.open),
  });
  return { api: combobox.connect(service, normalizeProps), collection };
}
