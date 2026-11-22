'use client';

import {
  buttonGroupVariants,
  toggleButtonVariants,
  type ButtonGroupVariantProps,
  type ToggleButtonVariantProps,
} from '@tessen-ui/core/contracts/toggle-button';
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControllable } from '../../internal/use-controllable.ts';

export interface ToggleButtonProps
  extends
    ToggleButtonVariantProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ToggleButtonVariantProps> {
  pressed?: boolean;
  /** Initial state when `pressed` is not used. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

/** A button with an on/off state (`aria-pressed`). Its text must not change with the state. */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  { variant, size, pressed, defaultPressed, onPressedChange, onClick, className, ...rest },
  ref,
) {
  const [isPressed, setPressed] = useControllable(
    pressed,
    defaultPressed ?? false,
    onPressedChange,
  );
  const resolved = toggleButtonVariants({ variant, size });
  return (
    <button
      type="button"
      {...rest}
      {...resolved.attrs}
      ref={ref}
      aria-pressed={isPressed}
      data-state={isPressed ? 'on' : 'off'}
      className={cx(resolved.class, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setPressed(!isPressed);
      }}
    />
  );
});

export interface ButtonGroupProps
  extends
    ButtonGroupVariantProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof ButtonGroupVariantProps> {}

/** Groups related buttons. Give it an `aria-label`: it is exposed as `role="group"`. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation, attached, className, ...rest },
  ref,
) {
  const resolved = buttonGroupVariants({ orientation, attached });
  return (
    <div
      {...rest}
      {...resolved.attrs}
      ref={ref}
      role="group"
      className={cx(resolved.class, className)}
    />
  );
});
