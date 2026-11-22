'use client';

import {
  nativeSelectVariants,
  type NativeSelectVariantProps,
} from '@tessen-ui/core/contracts/native-select';
import { forwardRef, type ChangeEvent, type CSSProperties, type SelectHTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlState } from '../../internal/field-context.ts';

export interface NativeSelectProps
  extends NativeSelectVariantProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Receives the new value on every change (next to the native `onChange`). */
  onValueChange?: (value: string) => void;
}

/**
 * A styled native `<select>` (best on mobile). `className` and `style` style the wrapper;
 * everything else (and the `ref`) is for the `<select>`. Options are plain `<option>` children.
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { size, invalid, onValueChange, onChange, className, style, disabled, id, children, ...rest },
  ref,
) {
  const state = useControlState({
    invalid,
    disabled,
    id,
    'aria-describedby': rest['aria-describedby'],
  });
  const resolved = nativeSelectVariants({ size, invalid: state.invalid });
  return (
    <div
      {...resolved.attrs}
      className={cx(resolved.class, className)}
      style={style as CSSProperties}
    >
      <select
        {...rest}
        ref={ref}
        id={state.id}
        className="t-native-select__control"
        disabled={state.disabled}
        required={state.required || rest.required}
        aria-invalid={state.invalid || undefined}
        aria-describedby={state.describedBy}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      >
        {children}
      </select>
    </div>
  );
});
