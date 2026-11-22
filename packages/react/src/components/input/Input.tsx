'use client';

import { inputVariants, type InputVariantProps } from '@tessen-ui/core/contracts/input';
import {
  forwardRef,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlState } from '../../internal/field-context.ts';

export interface InputProps
  extends InputVariantProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
  /** Content before the control (an icon). */
  leading?: ReactNode;
  /** Content after the control (an icon, or an `IconButton` to clear or reveal). */
  trailing?: ReactNode;
  /** Receives the new value on every change (next to the native `onChange`). */
  onValueChange?: (value: string) => void;
}

/**
 * `className` and `style` style the wrapper; everything else (and the `ref`) is for the native
 * `<input>`, so `name`, `placeholder`, `autoComplete`... work as expected.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size,
    invalid,
    type = 'text',
    leading,
    trailing,
    onValueChange,
    onChange,
    className,
    style,
    disabled,
    readOnly,
    id,
    ...rest
  },
  ref,
) {
  const state = useControlState({
    invalid,
    disabled,
    readOnly,
    id,
    'aria-describedby': rest['aria-describedby'],
  });
  const resolved = inputVariants({ size, invalid: state.invalid });
  return (
    <div
      {...resolved.attrs}
      className={cx(resolved.class, className)}
      style={style as CSSProperties}
    >
      {leading && <span className="t-input__leading">{leading}</span>}
      <input
        {...rest}
        ref={ref}
        id={state.id}
        className="t-input__control"
        type={type}
        disabled={state.disabled}
        readOnly={state.readOnly}
        required={state.required || rest.required}
        aria-invalid={state.invalid || undefined}
        aria-describedby={state.describedBy}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      />
      {trailing && <span className="t-input__trailing">{trailing}</span>}
    </div>
  );
});
