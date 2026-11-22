'use client';

import { alertRoles, alertVariants, type AlertVariantProps } from '@tessen-ui/core/contracts/alert';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';

export interface AlertProps
  extends AlertVariantProps, Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  /** Decorative icon; hidden from assistive technology. */
  icon?: ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone, title, icon, className, children, ...rest },
  ref,
) {
  const resolved = alertVariants({ tone });
  return (
    <div
      {...rest}
      {...resolved.attrs}
      ref={ref}
      // `warning` and `danger` interrupt the reader; `info` and `success` wait their turn.
      role={alertRoles[tone ?? 'info']}
      className={cx(resolved.class, className)}
    >
      {icon && (
        <span className="t-alert__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="t-alert__content">
        {title && <div className="t-alert__title">{title}</div>}
        <div className="t-alert__body">{children}</div>
      </div>
    </div>
  );
});
