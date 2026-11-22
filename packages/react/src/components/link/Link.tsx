'use client';

import { linkVariants, type LinkVariantProps } from '@tessen-ui/core/contracts/link';
import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface LinkProps
  extends
    Omit<LinkVariantProps, 'external'>,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  href: string;
  /** Opens in a new tab with `rel="noopener noreferrer"` and announces it. */
  external?: boolean;
  /** Text announced for external links. */
  externalLabel?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant, external, externalLabel = '(opens in a new tab)', className, children, ...rest },
  ref,
) {
  const resolved = linkVariants({ variant, external });
  return (
    <a
      {...rest}
      {...resolved.attrs}
      ref={ref}
      className={cx(resolved.class, className)}
      target={external ? '_blank' : rest.target}
      rel={external ? 'noopener noreferrer' : rest.rel}
    >
      {children}
      {external && <span className="t-link__external">{externalLabel}</span>}
    </a>
  );
});
