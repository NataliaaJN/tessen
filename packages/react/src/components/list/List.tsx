'use client';

import { listVariants, type ListVariantProps } from '@tessen-ui/core/contracts/list';
import { forwardRef, type HTMLAttributes, type LiHTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';

export interface ListProps
  extends ListVariantProps, Omit<HTMLAttributes<HTMLElement>, keyof ListVariantProps> {}

/** `ul`, or `ol` with `ordered`. `role="list"` keeps the list semantics when the markers are removed. */
export const List = forwardRef<HTMLElement, ListProps>(function List(
  { variant, ordered, className, ...rest },
  ref,
) {
  const resolved = listVariants({ variant, ordered });
  const common = { ...rest, ...resolved.attrs, className: cx(resolved.class, className) };
  return ordered ? (
    <ol {...common} ref={ref as React.Ref<HTMLOListElement>} role="list" />
  ) : (
    <ul {...common} ref={ref as React.Ref<HTMLUListElement>} role="list" />
  );
});

export type ListItemProps = LiHTMLAttributes<HTMLLIElement>;

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  { className, ...rest },
  ref,
) {
  return <li {...rest} ref={ref} className={cx('t-list__item', className)} />;
});
