import * as select from '@zag-js/select';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, useId, type PropType } from 'vue';
import { Portal, toValues, type Item } from './shared.ts';

/** Public API: `items`, `label`, `v-model` (`modelValue`), `defaultValue`, `v-model:open`. */
export const Select = defineComponent({
  name: 'TSelect',
  props: {
    items: { type: Array as PropType<Item[]>, required: true },
    label: { type: String, required: true },
    modelValue: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    placeholder: { type: String, default: 'Select an option' },
    disabled: { type: Boolean, default: undefined },
    name: { type: String, default: undefined },
  },
  emits: {
    'update:modelValue': (value: string | null) => value === null || typeof value === 'string',
    'update:open': (open: boolean) => typeof open === 'boolean',
  },
  setup(props, { emit }) {
    const id = useId();
    const collection = computed(() => select.collection({ items: props.items }));
    const service = useMachine(
      select.machine,
      computed(() => ({
        id,
        collection: collection.value,
        value: toValues(props.modelValue),
        defaultValue: props.defaultValue === undefined ? undefined : [props.defaultValue],
        open: props.open,
        defaultOpen: props.defaultOpen,
        disabled: props.disabled,
        name: props.name,
        onValueChange: (details: { value: string[] }) =>
          emit('update:modelValue', details.value[0] ?? null),
        onOpenChange: (details: { open: boolean }) => emit('update:open', details.open),
      })),
    );
    const api = computed(() => select.connect(service, normalizeProps));

    return () =>
      h('div', { class: 't-select', ...api.value.getRootProps() }, [
        h('label', { class: 't-select__label', ...api.value.getLabelProps() }, props.label),
        h('div', { class: 't-select__control', ...api.value.getControlProps() }, [
          h(
            'button',
            { class: 't-select__trigger', ...api.value.getTriggerProps() },
            api.value.valueAsString || props.placeholder,
          ),
        ]),
        h(
          'select',
          api.value.getHiddenSelectProps(),
          collection.value.items.map((item) => h('option', { value: item.value }, item.label)),
        ),
        h(Portal, null, {
          default: () =>
            h('div', { class: 't-select__positioner', ...api.value.getPositionerProps() }, [
              h(
                'ul',
                { class: 't-select__content', ...api.value.getContentProps() },
                collection.value.items.map((item) =>
                  h(
                    'li',
                    {
                      key: item.value,
                      class: 't-select__item',
                      ...api.value.getItemProps({ item }),
                    },
                    [
                      h('span', api.value.getItemTextProps({ item }), item.label),
                      h('span', api.value.getItemIndicatorProps({ item }), '✓'),
                    ],
                  ),
                ),
              ),
            ]),
        }),
      ]);
  },
});
