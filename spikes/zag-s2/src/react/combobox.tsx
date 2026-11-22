import * as combobox from '@zag-js/combobox';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId, useMemo, useState } from 'react';
import { Portal, type Item } from './shared.tsx';

export interface ComboboxProps {
  items: Item[];
  label: string;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

const matches = (item: Item, query: string) =>
  item.label.toLowerCase().includes(query.trim().toLowerCase());

export function Combobox({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placeholder,
  disabled,
}: ComboboxProps) {
  // Filtering is TESSEN's job: the machine only renders the collection it is given.
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const filtered = items.filter((item) => matches(item, query));
    return query ? filtered : items;
  }, [items, query]);
  const collection = useMemo(() => combobox.collection({ items: visible }), [visible]);

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    value: value === undefined ? undefined : value === null ? [] : [value],
    defaultValue: defaultValue === undefined ? undefined : [defaultValue],
    open,
    defaultOpen,
    disabled,
    placeholder,
    onInputValueChange: (details) => setQuery(details.inputValue),
    onValueChange: (details) => onValueChange?.(details.value[0] ?? null),
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  const api = combobox.connect(service, normalizeProps);

  return (
    <div className="t-combobox" {...api.getRootProps()}>
      <label className="t-combobox__label" {...api.getLabelProps()}>
        {label}
      </label>
      <div className="t-combobox__control" {...api.getControlProps()}>
        <input className="t-combobox__input" {...api.getInputProps()} />
        <button
          className="t-combobox__trigger"
          aria-label="Show options"
          {...api.getTriggerProps()}
        >
          ▾
        </button>
      </div>
      <Portal>
        <div className="t-combobox__positioner" {...api.getPositionerProps()}>
          <ul className="t-combobox__content" {...api.getContentProps()}>
            {collection.items.length === 0 ? (
              <li role="presentation">No results</li>
            ) : (
              collection.items.map((item) => (
                <li key={item.value} className="t-combobox__item" {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </Portal>
    </div>
  );
}
