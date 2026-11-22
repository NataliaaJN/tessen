'use client';

import { skeletonVariants, type SkeletonVariantProps } from '@tessen-ui/core/contracts/skeleton';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface SkeletonProps
  extends SkeletonVariantProps, Omit<HTMLAttributes<HTMLSpanElement>, keyof SkeletonVariantProps> {}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { shape, animated, className, ...rest },
  ref,
) {
  const resolved = skeletonVariants({ shape, animated });
  return (
    <span
      {...rest}
      {...resolved.attrs}
      aria-hidden="true"
      ref={ref}
      className={cx(resolved.class, className)}
    />
  );
});
