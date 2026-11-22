'use client';

import { comboboxVariants, type ComboboxVariantProps } from '@tessen-ui/core/contracts/combobox';
import type { SelectItem } from '@tessen-ui/core/contracts/select';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { Portal } from '../../internal/portal.tsx';
import { useComboboxRoot } from './combobox.zag.ts';

export interface ComboboxProps
  extends ComboboxVariantProps, Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  items: readonly SelectItem[];
  /** Visible label. It is also the accessible name of the input. */
  label: string;
  /** Selected value. Use `null` for "nothing"; omit it to let the component keep the state. */
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  /** Text shown when the typed text matches no option. */
  emptyText?: string;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Input with a list of options filtered by what is typed. Picks one of the given items. */
export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(function Combobox(
  {
    items,
    label,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    emptyText = 'No results',
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
  const { api, collection } = useComboboxRoot({
    items,
    value,
    defaultValue,
    open,
    defaultOpen,
    disabled,
    placeholder,
    onValueChange,
    onOpenChange,
  });
  const resolved = comboboxVariants({ size });
  return (
    <div
      {...api.getRootProps()}
      {...rest}
      {...resolved.attrs}
      ref={ref}
      className={cx(resolved.class, className)}
    >
      <label {...api.getLabelProps()} className="t-combobox__label">
        {label}
      </label>
      <div {...api.getControlProps()} className="t-combobox__control">
        <input {...api.getInputProps()} className="t-combobox__input" />
        <button
          {...api.getTriggerProps()}
          className="t-combobox__trigger"
          aria-label="Show options"
        >
          <span className="t-combobox__chevron" aria-hidden="true" />
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()} className="t-combobox__positioner">
          <ul {...api.getContentProps()} className="t-combobox__content">
            {collection.items.length === 0 ? (
              <li role="presentation" className="t-combobox__empty">
                {emptyText}
              </li>
            ) : (
              collection.items.map((item) => (
                <li key={item.value} {...api.getItemProps({ item })} className="t-combobox__item">
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span
                    {...api.getItemIndicatorProps({ item })}
                    className="t-combobox__indicator"
                  />
                </li>
              ))
            )}
          </ul>
        </div>
      </Portal>
    </div>
  );
});
