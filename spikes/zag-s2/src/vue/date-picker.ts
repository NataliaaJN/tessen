import { parseDate } from '@internationalized/date';
import * as datePicker from '@zag-js/date-picker';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, ref, useId, watch, type PropType } from 'vue';
import { Portal } from './shared.ts';

const toValue = (iso: string | null | undefined) => (iso ? [parseDate(iso)] : []);

/** Public API: `label`, `v-model` (ISO date), `min`, `max`, `disabledDates`, `locale`, `v-model:open`. */
export const DatePicker = defineComponent({
  name: 'TDatePicker',
  props: {
    label: { type: String, required: true },
    modelValue: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String, default: undefined },
    min: { type: String, default: undefined },
    max: { type: String, default: undefined },
    disabledDates: { type: Array as PropType<string[]>, default: undefined },
    locale: { type: String, default: 'en-US' },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
  },
  emits: {
    'update:modelValue': (value: string | null) => value === null || typeof value === 'string',
    'update:open': (open: boolean) => typeof open === 'boolean',
  },
  setup(props, { emit }) {
    const id = useId();
    const service = useMachine(
      datePicker.machine,
      computed(() => ({
        id,
        locale: props.locale,
        value: props.modelValue === undefined ? undefined : toValue(props.modelValue),
        defaultValue: props.defaultValue === undefined ? undefined : toValue(props.defaultValue),
        min: props.min ? parseDate(props.min) : undefined,
        max: props.max ? parseDate(props.max) : undefined,
        isDateUnavailable: props.disabledDates
          ? (date: { toString(): string }) => props.disabledDates!.includes(date.toString())
          : undefined,
        open: props.open,
        defaultOpen: props.defaultOpen,
        disabled: props.disabled,
        onValueChange: (details: { value: { toString(): string }[] }) =>
          emit('update:modelValue', details.value[0]?.toString() ?? null),
        onOpenChange: (details: { open: boolean }) => emit('update:open', details.open),
      })),
    );
    const api = computed(() => datePicker.connect(service, normalizeProps));

    // Zag's Vue `normalizeProps` turns the input's `defaultValue` into `value`, which makes Vue
    // rewrite the field while the user types (the caret jumps to the start). Keep the input
    // uncontrolled like in React: the initial value goes in once, later changes are pushed by hand.
    const input = ref<HTMLInputElement | null>(null);
    const initialText = api.value.getInputProps().value;
    watch(
      () => api.value.getInputProps().value,
      (text) => {
        if (input.value && input.value.value !== text) input.value.value = String(text ?? '');
      },
    );

    return () =>
      h('div', { class: 't-date-picker', ...api.value.getRootProps() }, [
        h('label', api.value.getLabelProps(), props.label),
        h('div', api.value.getControlProps(), [
          h('input', {
            ...api.value.getInputProps(),
            value: initialText,
            ref: input,
          }),
          h('button', { 'aria-label': 'Open calendar', ...api.value.getTriggerProps() }, '📅'),
        ]),
        h(Portal, null, {
          default: () =>
            h('div', api.value.getPositionerProps(), [
              h('div', { class: 't-date-picker__content', ...api.value.getContentProps() }, [
                h('div', api.value.getViewControlProps({ view: 'day' }), [
                  h('button', api.value.getPrevTriggerProps(), '‹'),
                  h('span', api.value.getRangeTextProps(), api.value.visibleRangeText.start),
                  h('button', api.value.getNextTriggerProps(), '›'),
                ]),
                h('table', api.value.getTableProps({ view: 'day' }), [
                  h('thead', api.value.getTableHeadProps({ view: 'day' }), [
                    h(
                      'tr',
                      api.value.getTableRowProps({ view: 'day' }),
                      api.value.weekDays.map((day) =>
                        h(
                          'th',
                          {
                            key: day.short,
                            'aria-label': day.long,
                            ...api.value.getTableHeaderProps({ view: 'day' }),
                          },
                          day.narrow,
                        ),
                      ),
                    ),
                  ]),
                  h(
                    'tbody',
                    api.value.getTableBodyProps({ view: 'day' }),
                    api.value.weeks.map((week, index) =>
                      h(
                        'tr',
                        { key: index, ...api.value.getTableRowProps({ view: 'day' }) },
                        week.map((date) =>
                          h(
                            'td',
                            {
                              key: date.toString(),
                              ...api.value.getDayTableCellProps({ value: date }),
                            },
                            [
                              h(
                                'div',
                                api.value.getDayTableCellTriggerProps({ value: date }),
                                String(date.day),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ]),
              ]),
            ]),
        }),
      ]);
  },
});
