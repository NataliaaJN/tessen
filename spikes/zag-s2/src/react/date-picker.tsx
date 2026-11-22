import { parseDate } from '@internationalized/date';
import * as datePicker from '@zag-js/date-picker';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId } from 'react';
import { Portal } from './shared.tsx';

export interface DatePickerProps {
  label: string;
  /** ISO date (`2026-11-22`); omit for uncontrolled, `null` for controlled and empty. */
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  /** ISO dates that cannot be picked. */
  disabledDates?: string[];
  /** BCP 47 language tag. Defaults to `en-US`. */
  locale?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

const toValue = (iso: string | null | undefined) => (iso ? [parseDate(iso)] : []);

export function DatePicker({
  label,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  disabledDates,
  locale = 'en-US',
  open,
  defaultOpen,
  onOpenChange,
  disabled,
}: DatePickerProps) {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale,
    value: value === undefined ? undefined : toValue(value),
    defaultValue: defaultValue === undefined ? undefined : toValue(defaultValue),
    min: min ? parseDate(min) : undefined,
    max: max ? parseDate(max) : undefined,
    isDateUnavailable: disabledDates
      ? (date) => disabledDates.includes(date.toString())
      : undefined,
    open,
    defaultOpen,
    disabled,
    onValueChange: (details) => onValueChange?.(details.value[0]?.toString() ?? null),
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  const api = datePicker.connect(service, normalizeProps);

  return (
    <div className="t-date-picker" {...api.getRootProps()}>
      <label {...api.getLabelProps()}>{label}</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button aria-label="Open calendar" {...api.getTriggerProps()}>
          📅
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div className="t-date-picker__content" {...api.getContentProps()}>
            <div {...api.getViewControlProps({ view: 'day' })}>
              <button {...api.getPrevTriggerProps()}>‹</button>
              <span {...api.getRangeTextProps()}>{api.visibleRangeText.start}</span>
              <button {...api.getNextTriggerProps()}>›</button>
            </div>
            <table {...api.getTableProps({ view: 'day' })}>
              <thead {...api.getTableHeadProps({ view: 'day' })}>
                <tr {...api.getTableRowProps({ view: 'day' })}>
                  {api.weekDays.map((day) => (
                    <th
                      key={day.short}
                      aria-label={day.long}
                      {...api.getTableHeaderProps({ view: 'day' })}
                    >
                      {day.narrow}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody {...api.getTableBodyProps({ view: 'day' })}>
                {api.weeks.map((week, index) => (
                  <tr key={index} {...api.getTableRowProps({ view: 'day' })}>
                    {week.map((date) => (
                      <td key={date.toString()} {...api.getDayTableCellProps({ value: date })}>
                        <div {...api.getDayTableCellTriggerProps({ value: date })}>{date.day}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Portal>
    </div>
  );
}
