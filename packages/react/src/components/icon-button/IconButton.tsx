'use client';

import {
  iconButtonVariants,
  type IconButtonVariantProps,
} from '@tessen-ui/core/contracts/icon-button';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';

export interface IconButtonProps
  extends
    IconButtonVariantProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'children'> {
  /** Accessible name. Required: an icon alone has no name. */
  label: string;
  /** The icon. It is hidden from assistive technology. */
  children?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant, size, tone, label, type = 'button', className, children, ...rest },
  ref,
) {
  const resolved = iconButtonVariants({ variant, size, tone });
  return (
    <button
      {...rest}
      {...resolved.attrs}
      ref={ref}
      type={type}
      className={cx(resolved.class, className)}
      aria-label={label}
    >
      <span className="t-icon-button__icon" aria-hidden="true">
        {children}
      </span>
    </button>
  );
});
