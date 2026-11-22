'use client';

import { spinnerVariants, type SpinnerVariantProps } from '@tessen-ui/core/contracts/spinner';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface SpinnerProps extends SpinnerVariantProps, HTMLAttributes<HTMLSpanElement> {
  /** Text announced to assistive technology. */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size, label = 'Loading', className, ...rest },
  ref,
) {
  const resolved = spinnerVariants({ size });
  return (
    <span
      {...rest}
      {...resolved.attrs}
      ref={ref}
      role="status"
      className={cx(resolved.class, className)}
    >
      <span className="t-spinner__circle" aria-hidden="true" />
      <span className="t-spinner__label">{label}</span>
    </span>
  );
});
