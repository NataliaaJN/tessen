'use client';

import {
  selectVariants,
  type SelectItem,
  type SelectVariantProps,
} from '@tessen-ui/core/contracts/select';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { Portal } from '../../internal/portal.tsx';
import { useSelectRoot } from './select.zag.ts';

export type { SelectItem };

export interface SelectProps
  extends SelectVariantProps, Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  items: readonly SelectItem[];
  /** Visible label. It is also the accessible name of the control. */
  label: string;
  /** Selected value. Use `null` for "nothing"; omit it to let the component keep the state. */
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  /** Adds a hidden native `<select>` with this name so the value reaches a `<form>`. */
  name?: string;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    items,
    label,
    value,
    defaultValue,
    onValueChange,
    placeholder = 'Select an option',
    name,
    disabled,
    open,
    defaultOpen,
    onOpenChange,
    size,
    className,
    ...rest
  },
  ref,
) {
  const { api, collection } = useSelectRoot({
    items,
    value,
    defaultValue,
    open,
    defaultOpen,
    disabled,
    name,
    onValueChange,
    onOpenChange,
  });
  const resolved = selectVariants({ size });
  return (
    <div
      {...api.getRootProps()}
      {...rest}
      {...resolved.attrs}
      ref={ref}
      className={cx(resolved.class, className)}
    >
      <label {...api.getLabelProps()} className="t-select__label">
        {label}
      </label>
      <div {...api.getControlProps()} className="t-select__control">
        <button {...api.getTriggerProps()} className="t-select__trigger">
          <span className="t-select__value" data-placeholder={api.valueAsString ? undefined : ''}>
            {api.valueAsString || placeholder}
          </span>
          <span className="t-select__chevron" aria-hidden="true" />
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
        <div {...api.getPositionerProps()} className="t-select__positioner">
          <ul {...api.getContentProps()} className="t-select__content">
            {collection.items.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })} className="t-select__item">
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })} className="t-select__indicator" />
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  );
});
