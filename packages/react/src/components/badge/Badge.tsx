'use client';

import { badgeVariants, type BadgeVariantProps } from '@tessen-ui/core/contracts/badge';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface BadgeProps
  extends BadgeVariantProps, Omit<HTMLAttributes<HTMLSpanElement>, keyof BadgeVariantProps> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant, tone, size, className, ...rest },
  ref,
) {
  const resolved = badgeVariants({ variant, tone, size });
  return <span {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />;
});
