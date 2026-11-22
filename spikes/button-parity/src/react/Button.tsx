import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { buttonVariants, type ButtonVariantProps } from '../core/button.contract.ts';

export interface ButtonProps
  extends ButtonVariantProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const cx = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ');

export function Button({
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
  ref,
  ...rest
}: ButtonProps) {
  const v = buttonVariants({ variant, size, tone, block });
  return (
    <button
      {...rest}
      {...v.attrs}
      ref={ref}
      type={type}
      className={cx(v.class, className)}
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
}
