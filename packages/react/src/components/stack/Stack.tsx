'use client';

import { stackVariants, type StackVariantProps } from '@tessen-ui/core/contracts/stack';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface StackProps
  extends StackVariantProps, Omit<HTMLAttributes<HTMLDivElement>, keyof StackVariantProps> {}

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction, gap, align, justify, wrap, className, ...rest },
  ref,
) {
  const resolved = stackVariants({ direction, gap, align, justify, wrap });
  return <div {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />;
});
