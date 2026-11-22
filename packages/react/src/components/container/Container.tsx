'use client';

import { containerVariants, type ContainerVariantProps } from '@tessen-ui/core/contracts/container';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface ContainerProps
  extends
    ContainerVariantProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof ContainerVariantProps> {}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { size, gutters, className, ...rest },
  ref,
) {
  const resolved = containerVariants({ size, gutters });
  return <div {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />;
});
