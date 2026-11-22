'use client';

import {
  progressPercent,
  progressVariants,
  type ProgressVariantProps,
} from '@tessen-ui/core/contracts/progress';
import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface ProgressProps
  extends ProgressVariantProps, Omit<HTMLAttributes<HTMLDivElement>, keyof ProgressVariantProps> {
  /** Current value; leave it out for an indeterminate progress. */
  value?: number;
  max?: number;
}

/** Give it an accessible name (`aria-label` or `aria-labelledby`): a bar alone has none. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, size, tone, className, style, ...rest },
  ref,
) {
  const resolved = progressVariants({ size, tone });
  const percent = progressPercent(value, max);
  const now = percent === undefined ? undefined : (percent / 100) * max;
  return (
    <div
      {...rest}
      {...resolved.attrs}
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={now}
      data-state={percent === undefined ? 'indeterminate' : 'determinate'}
      className={cx(resolved.class, className)}
      style={{ ...style, '--_value': `${percent ?? 0}%` } as CSSProperties}
    >
      <div className="t-progress__bar" />
    </div>
  );
});
