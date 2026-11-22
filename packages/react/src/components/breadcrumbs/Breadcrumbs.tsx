'use client';

import { breadcrumbsVariants } from '@tessen-ui/core/contracts/breadcrumbs';
import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export type BreadcrumbsProps = HTMLAttributes<HTMLElement>;

/** A navigation landmark with an ordered list of `BreadcrumbItem`s. */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { className, children, 'aria-label': ariaLabel = 'Breadcrumb', ...rest },
  ref,
) {
  const resolved = breadcrumbsVariants();
  return (
    <nav
      {...rest}
      {...resolved.attrs}
      ref={ref}
      aria-label={ariaLabel}
      className={cx(resolved.class, className)}
    >
      <ol className="t-breadcrumbs__list">{children}</ol>
    </nav>
  );
});

export interface BreadcrumbItemProps extends Omit<AnchorHTMLAttributes<HTMLElement>, 'href'> {
  href?: string;
  /** The page being shown: rendered as text with `aria-current="page"`, not as a link. */
  current?: boolean;
}

export const BreadcrumbItem = forwardRef<HTMLElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { href, current, className, children, ...rest },
  ref,
) {
  return (
    <li className="t-breadcrumbs__item">
      {current || href === undefined ? (
        <span
          {...rest}
          ref={ref}
          aria-current={current ? 'page' : undefined}
          className={cx('t-breadcrumbs__current', className)}
        >
          {children}
        </span>
      ) : (
        <a
          {...rest}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cx('t-breadcrumbs__link', className)}
        >
          {children}
        </a>
      )}
    </li>
  );
});
