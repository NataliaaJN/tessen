'use client';

import {
  radioGroupVariants,
  radioVariants,
  type RadioGroupVariantProps,
  type RadioVariantProps,
} from '@tessen-ui/core/contracts/radio-group';
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useField } from '../../internal/field-context.ts';
import { useControllable } from '../../internal/use-controllable.ts';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  disabled: boolean;
  invalid: boolean;
  select(value: string): void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps
  extends
    RadioGroupVariantProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof RadioGroupVariantProps | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shared `name` of the radios (form participation). Generated when omitted. */
  name?: string;
  disabled?: boolean;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    orientation,
    invalid,
    value,
    defaultValue,
    onValueChange,
    name,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  const uid = useId();
  const field = useField();
  const [current, setCurrent] = useControllable<string | undefined>(
    value,
    defaultValue,
    onValueChange as ((next: string | undefined) => void) | undefined,
  );
  const isInvalid = !!invalid || !!field?.invalid;
  const isDisabled = !!disabled || !!field?.disabled;
  const context = useMemo(
    () => ({
      name: name ?? `t-radio-${uid}`,
      value: current,
      disabled: isDisabled,
      invalid: isInvalid,
      select: (next: string) => setCurrent(next),
    }),
    [name, uid, current, isDisabled, isInvalid, setCurrent],
  );
  const resolved = radioGroupVariants({ orientation, invalid: isInvalid });
  return (
    <RadioGroupContext.Provider value={context}>
      <div
        {...rest}
        {...resolved.attrs}
        ref={ref}
        role="radiogroup"
        className={cx(resolved.class, className)}
        data-disabled={isDisabled ? '' : undefined}
        aria-invalid={isInvalid || undefined}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

export interface RadioProps
  extends
    RadioVariantProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value'> {
  value: string;
  /** The text of the label. */
  children?: ReactNode;
}

/** `className` and `style` style the wrapping label; the rest (and the `ref`) is for the native radio. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { size, value, disabled, onChange, className, style, children, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const checked = group?.value === value;
  const resolved = radioVariants({ size });
  return (
    <label
      {...resolved.attrs}
      className={cx(resolved.class, className)}
      style={style as CSSProperties}
      data-state={checked ? 'checked' : 'unchecked'}
    >
      <input
        {...rest}
        ref={ref}
        className="t-radio__input"
        type="radio"
        name={group?.name}
        value={value}
        checked={checked}
        disabled={disabled || group?.disabled}
        aria-invalid={group?.invalid || undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          group?.select(value);
        }}
      />
      <span className="t-radio__circle" aria-hidden="true">
        <span className="t-radio__dot" />
      </span>
      {children && <span className="t-radio__label">{children}</span>}
    </label>
  );
});
