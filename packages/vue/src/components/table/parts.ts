import { defineComponent, h } from 'vue';

/** The six thin parts of a table: one element each, a class, the slot and attribute passthrough. */
function part(name: string, tag: string, className: string) {
  return defineComponent({
    name,
    setup:
      (_props, { slots }) =>
      () =>
        h(tag, { class: className }, slots.default?.()),
  });
}

function cell(name: string, tag: 'th' | 'td', className: string) {
  return defineComponent({
    name,
    props: {
      /** Aligns the content to the end (numbers). */
      numeric: { type: Boolean, default: false },
      /** `th` only: `col` unless told otherwise (use `row` for row headers). */
      scope: { type: String, default: undefined },
    },
    setup:
      (props, { slots }) =>
      () =>
        h(
          tag,
          {
            class: className,
            'data-numeric': props.numeric ? '' : undefined,
            scope: tag === 'th' ? (props.scope ?? 'col') : undefined,
          },
          slots.default?.(),
        ),
  });
}

export const TTableCaption = part('TTableCaption', 'caption', 't-table__caption');
export const TTableHead = part('TTableHead', 'thead', 't-table__head');
export const TTableBody = part('TTableBody', 'tbody', 't-table__body');
export const TTableRow = part('TTableRow', 'tr', 't-table__row');
export const TTableHeaderCell = cell('TTableHeaderCell', 'th', 't-table__header-cell');
export const TTableCell = cell('TTableCell', 'td', 't-table__cell');
