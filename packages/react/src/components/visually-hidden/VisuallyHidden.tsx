'use client';

import {
  visuallyHiddenVariants,
  type VisuallyHiddenVariantProps,
} from '@tessen-ui/core/contracts/visually-hidden';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface VisuallyHiddenProps
  extends VisuallyHiddenVariantProps, HTMLAttributes<HTMLSpanElement> {}

export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ focusable, className, ...rest }, ref) {
    const resolved = visuallyHiddenVariants({ focusable });
    return (
      <span {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />
    );
  },
);
