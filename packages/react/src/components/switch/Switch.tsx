'use client';

import { switchVariants, type SwitchVariantProps } from '@tessen-ui/core/contracts/switch';
import {
  forwardRef,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlState } from '../../internal/field-context.ts';
import { useControllable } from '../../internal/use-controllable.ts';

export interface SwitchProps
  extends
    SwitchVariantProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'role'> {
  onCheckedChange?: (checked: boolean) => void;
  /** The text of the label. */
  children?: ReactNode;
}

/**
 * `className` and `style` style the wrapping label; everything else (and the `ref`) is for the
 * native `<input type="checkbox" role="switch">`. A switch takes effect immediately.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    size,
    invalid,
    checked,
    defaultChecked,
    onCheckedChange,
    onChange,
    className,
    style,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const state = useControlState({ invalid, disabled });
  const [isChecked, setChecked] = useControllable(
    checked,
    defaultChecked ?? false,
    onCheckedChange,
  );
  const resolved = switchVariants({ size, invalid: state.invalid });
  return (
    <label
      {...resolved.attrs}
      className={cx(resolved.class, className)}
      style={style as CSSProperties}
      data-state={isChecked ? 'checked' : 'unchecked'}
    >
      <input
        {...rest}
        ref={ref}
        className="t-switch__input"
        type="checkbox"
        role="switch"
        checked={isChecked}
        disabled={state.disabled}
        required={state.required || rest.required}
        aria-invalid={state.invalid || undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          setChecked(event.target.checked);
        }}
      />
      <span className="t-switch__track" aria-hidden="true">
        <span className="t-switch__thumb" />
      </span>
      {children && <span className="t-switch__label">{children}</span>}
    </label>
  );
});
