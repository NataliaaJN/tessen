'use client';

import {
  aspectRatioVariants,
  type AspectRatioVariantProps,
} from '@tessen-ui/core/contracts/aspect-ratio';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface AspectRatioProps
  extends
    AspectRatioVariantProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof AspectRatioVariantProps> {}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio, className, ...rest },
  ref,
) {
  const resolved = aspectRatioVariants({ ratio });
  return <div {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />;
});
