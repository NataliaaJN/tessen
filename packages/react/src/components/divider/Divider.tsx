'use client';

import { dividerVariants, type DividerVariantProps } from '@tessen-ui/core/contracts/divider';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface DividerProps
  extends DividerVariantProps, Omit<HTMLAttributes<HTMLElement>, keyof DividerVariantProps> {
  /** Purely visual: removes the separator from the accessibility tree. */
  decorative?: boolean;
}

export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  { orientation, decorative, className, ...rest },
  ref,
) {
  const resolved = dividerVariants({ orientation });
  const common = { ...rest, ...resolved.attrs, className: cx(resolved.class, className) };
  if (orientation === 'vertical') {
    return (
      <div
        {...common}
        ref={ref as React.Ref<HTMLDivElement>}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : 'vertical'}
      />
    );
  }
  return (
    <hr {...common} ref={ref as React.Ref<HTMLHRElement>} role={decorative ? 'none' : undefined} />
  );
});
