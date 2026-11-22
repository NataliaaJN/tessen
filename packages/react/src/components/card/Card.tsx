'use client';

import { cardVariants, type CardVariantProps } from '@tessen-ui/core/contracts/card';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';

export interface CardProps
  extends CardVariantProps, Omit<HTMLAttributes<HTMLDivElement>, keyof CardVariantProps> {
  header?: ReactNode;
  footer?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant, padding, header, footer, className, children, ...rest },
  ref,
) {
  const resolved = cardVariants({ variant, padding });
  return (
    <div {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)}>
      {header && <div className="t-card__header">{header}</div>}
      <div className="t-card__body">{children}</div>
      {footer && <div className="t-card__footer">{footer}</div>}
    </div>
  );
});
