import * as select from '@zag-js/select';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId, useMemo } from 'react';
import { Portal, type Item } from './shared.tsx';

export interface SelectProps {
  items: Item[];
  label: string;
  /** Selected value; omit for uncontrolled. */
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
}

export function Select({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placeholder = 'Select an option',
  disabled,
  name,
}: SelectProps) {
  const collection = useMemo(() => select.collection({ items }), [items]);
  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    value: value === undefined ? undefined : value === null ? [] : [value],
    defaultValue: defaultValue === undefined ? undefined : [defaultValue],
    open,
    defaultOpen,
    disabled,
    name,
    onValueChange: (details) => onValueChange?.(details.value[0] ?? null),
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  const api = select.connect(service, normalizeProps);

  return (
    <div className="t-select" {...api.getRootProps()}>
      <label className="t-select__label" {...api.getLabelProps()}>
        {label}
      </label>
      <div className="t-select__control" {...api.getControlProps()}>
        <button className="t-select__trigger" {...api.getTriggerProps()}>
          {api.valueAsString || placeholder}
        </button>
      </div>
      <select {...api.getHiddenSelectProps()}>
        {collection.items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <Portal>
        <div className="t-select__positioner" {...api.getPositionerProps()}>
          <ul className="t-select__content" {...api.getContentProps()}>
            {collection.items.map((item) => (
              <li key={item.value} className="t-select__item" {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  );
}
