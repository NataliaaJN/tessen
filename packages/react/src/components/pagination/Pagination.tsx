'use client';

import {
  paginationRange,
  paginationVariants,
  type PaginationVariantProps,
} from '@tessen-ui/core/contracts/pagination';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControllable } from '../../internal/use-controllable.ts';

export interface PaginationProps
  extends
    PaginationVariantProps,
    Omit<HTMLAttributes<HTMLElement>, keyof PaginationVariantProps | 'onChange'> {
  pageCount: number;
  page?: number;
  /** Initial page when `page` is not used. */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Page buttons shown on each side of the current one. */
  siblings?: number;
  /** Visible and accessible text of the arrows, for translation. */
  previousLabel?: string;
  nextLabel?: string;
}

/** Page navigation. Buttons, not links: use it to change what a view shows. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    pageCount,
    page,
    defaultPage,
    onPageChange,
    siblings = 1,
    previousLabel = 'Previous page',
    nextLabel = 'Next page',
    size,
    className,
    'aria-label': ariaLabel = 'Pagination',
    ...rest
  },
  ref,
) {
  const [current, setCurrent] = useControllable(page, defaultPage ?? 1, onPageChange);
  const resolved = paginationVariants({ size });
  const items = paginationRange(current, pageCount, siblings);
  return (
    <nav
      {...rest}
      {...resolved.attrs}
      ref={ref}
      aria-label={ariaLabel}
      className={cx(resolved.class, className)}
    >
      <ul className="t-pagination__list">
        <li>
          <button
            type="button"
            className="t-pagination__control"
            data-part="previous"
            aria-label={previousLabel}
            disabled={current <= 1}
            onClick={() => setCurrent(current - 1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
        </li>
        {items.map((item) =>
          item.type === 'ellipsis' ? (
            <li
              key={item.key}
              className="t-pagination__ellipsis"
              data-part="ellipsis"
              aria-hidden="true"
            >
              …
            </li>
          ) : (
            <li key={item.page}>
              <button
                type="button"
                className="t-pagination__page"
                data-page={item.page}
                aria-label={`Page ${item.page}`}
                aria-current={item.page === current ? 'page' : undefined}
                onClick={() => setCurrent(item.page)}
              >
                {item.page}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className="t-pagination__control"
            data-part="next"
            aria-label={nextLabel}
            disabled={current >= pageCount}
            onClick={() => setCurrent(current + 1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </nav>
  );
});
