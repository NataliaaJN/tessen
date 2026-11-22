'use client';

import { gridVariants, type GridVariantProps } from '@tessen-ui/core/contracts/grid';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface GridProps
  extends GridVariantProps, Omit<HTMLAttributes<HTMLDivElement>, keyof GridVariantProps> {}

export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns, gap, className, ...rest },
  ref,
) {
  const resolved = gridVariants({ columns, gap });
  return <div {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />;
});
