'use client';

import { checkboxVariants, type CheckboxVariantProps } from '@tessen-ui/core/contracts/checkbox';
import {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlState } from '../../internal/field-context.ts';
import { useControllable, useMergedRef } from '../../internal/use-controllable.ts';

export interface CheckboxProps
  extends CheckboxVariantProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Mixed state: shown and exposed to assistive technology until the user toggles it. */
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** The text of the label. */
  children?: ReactNode;
}

/**
 * `className` and `style` style the wrapping label; everything else (and the `ref`) is for the
 * native `<input type="checkbox">`, which keeps taking part in forms.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    size,
    invalid,
    indeterminate = false,
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
  const inner = useRef<HTMLInputElement>(null);
  const merged = useMergedRef(ref, inner);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const resolved = checkboxVariants({ size, invalid: state.invalid });
  return (
    <label
      {...resolved.attrs}
      className={cx(resolved.class, className)}
      style={style as CSSProperties}
      data-state={indeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'}
    >
      <input
        {...rest}
        ref={merged}
        className="t-checkbox__input"
        type="checkbox"
        checked={isChecked}
        disabled={state.disabled}
        required={state.required || rest.required}
        aria-invalid={state.invalid || undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          setChecked(event.target.checked);
        }}
      />
      <span className="t-checkbox__box" aria-hidden="true">
        <svg viewBox="0 0 16 16" className="t-checkbox__mark t-checkbox__mark--check">
          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <svg viewBox="0 0 16 16" className="t-checkbox__mark t-checkbox__mark--minus">
          <path d="M4 8h8" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      {children && <span className="t-checkbox__label">{children}</span>}
    </label>
  );
});
