'use client';

import { tableVariants, type TableVariantProps } from '@tessen-ui/core/contracts/table';
import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cx } from '../../internal/cx.ts';

export interface TableProps
  extends TableVariantProps, Omit<TableHTMLAttributes<HTMLTableElement>, keyof TableVariantProps> {}

/** A real `<table>`. Name it with a `TableCaption` (or `aria-label`). */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { density, striped, className, ...rest },
  ref,
) {
  const resolved = tableVariants({ density, striped });
  return (
    <table {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />
  );
});

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;

export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, ...rest }, ref) {
    return <caption {...rest} ref={ref} className={cx('t-table__caption', className)} />;
  },
);

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(function TableHead(
  { className, ...rest },
  ref,
) {
  return <thead {...rest} ref={ref} className={cx('t-table__head', className)} />;
});

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, ...rest },
  ref,
) {
  return <tbody {...rest} ref={ref} className={cx('t-table__body', className)} />;
});

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, ...rest },
  ref,
) {
  return <tr {...rest} ref={ref} className={cx('t-table__row', className)} />;
});

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Aligns the content to the end (numbers). */
  numeric?: boolean;
}

/** `scope="col"` unless told otherwise (use `scope="row"` for row headers). */
export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({ numeric, scope = 'col', className, ...rest }, ref) {
    return (
      <th
        {...rest}
        ref={ref}
        scope={scope}
        data-numeric={numeric ? '' : undefined}
        className={cx('t-table__header-cell', className)}
      />
    );
  },
);

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { numeric, className, ...rest },
  ref,
) {
  return (
    <td
      {...rest}
      ref={ref}
      data-numeric={numeric ? '' : undefined}
      className={cx('t-table__cell', className)}
    />
  );
});
