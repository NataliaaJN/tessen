'use client';

import { buttonVariants, type ButtonVariantProps } from '@tessen-ui/core/contracts/button';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps
  extends ButtonVariantProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Shows a spinner, sets `aria-busy`/`aria-disabled` and ignores clicks, keeping focus. */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

/** `forwardRef` (not ref-as-prop) so that React 18.3 and 19 behave the same (D-11). */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    tone,
    block,
    loading = false,
    leadingIcon,
    trailingIcon,
    type = 'button',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const resolved = buttonVariants({ variant, size, tone, block });
  return (
    <button
      {...rest}
      {...resolved.attrs}
      ref={ref}
      type={type}
      className={className ? `${resolved.class} ${className}` : resolved.class}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={(event) => (loading ? event.preventDefault() : onClick?.(event))}
    >
      {loading && <span className="t-button__spinner" aria-hidden="true" />}
      {leadingIcon && <span className="t-button__icon">{leadingIcon}</span>}
      <span className="t-button__label">{children}</span>
      {trailingIcon && <span className="t-button__icon">{trailingIcon}</span>}
    </button>
  );
});
