'use client';

import {
  emptyStateVariants,
  type EmptyStateVariantProps,
} from '@tessen-ui/core/contracts/empty-state';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';

export interface EmptyStateProps
  extends
    EmptyStateVariantProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof EmptyStateVariantProps | 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Decorative illustration or icon. */
  icon?: ReactNode;
  /** The actions (buttons, links) as children. */
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { title, description, icon, size, className, children, ...rest },
  ref,
) {
  const resolved = emptyStateVariants({ size });
  return (
    <div {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)}>
      {icon && (
        <div className="t-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="t-empty-state__title">{title}</p>
      {description && <p className="t-empty-state__description">{description}</p>}
      {children && <div className="t-empty-state__actions">{children}</div>}
    </div>
  );
});
