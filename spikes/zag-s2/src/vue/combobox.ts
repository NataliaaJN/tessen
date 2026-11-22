import * as combobox from '@zag-js/combobox';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, ref, useId, type PropType } from 'vue';
import { Portal, toValues, type Item } from './shared.ts';

const matches = (item: Item, query: string) =>
  item.label.toLowerCase().includes(query.trim().toLowerCase());

/** Public API: `items`, `label`, `v-model` (`modelValue`), `defaultValue`, `v-model:open`. */
export const Combobox = defineComponent({
  name: 'TCombobox',
  props: {
    items: { type: Array as PropType<Item[]>, required: true },
    label: { type: String, required: true },
    modelValue: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
  },
  emits: {
    'update:modelValue': (value: string | null) => value === null || typeof value === 'string',
    'update:open': (open: boolean) => typeof open === 'boolean',
  },
  setup(props, { emit }) {
    const id = useId();
    // Filtering is TESSEN's job: the machine only renders the collection it is given.
    const query = ref('');
    const visible = computed(() => {
      const filtered = props.items.filter((item) => matches(item, query.value));
      return query.value ? filtered : props.items;
    });
    const collection = computed(() => combobox.collection({ items: visible.value }));
    const service = useMachine(
      combobox.machine,
      computed(() => ({
        id,
        collection: collection.value,
        value: toValues(props.modelValue),
        defaultValue: props.defaultValue === undefined ? undefined : [props.defaultValue],
        open: props.open,
        defaultOpen: props.defaultOpen,
        disabled: props.disabled,
        placeholder: props.placeholder,
        onInputValueChange: (details: { inputValue: string }) => (query.value = details.inputValue),
        onValueChange: (details: { value: string[] }) =>
          emit('update:modelValue', details.value[0] ?? null),
        onOpenChange: (details: { open: boolean }) => emit('update:open', details.open),
      })),
    );
    const api = computed(() => combobox.connect(service, normalizeProps));

    return () =>
      h('div', { class: 't-combobox', ...api.value.getRootProps() }, [
        h('label', { class: 't-combobox__label', ...api.value.getLabelProps() }, props.label),
        h('div', { class: 't-combobox__control', ...api.value.getControlProps() }, [
          h('input', { class: 't-combobox__input', ...api.value.getInputProps() }),
          h(
            'button',
            {
              class: 't-combobox__trigger',
              'aria-label': 'Show options',
              ...api.value.getTriggerProps(),
            },
            '▾',
          ),
        ]),
        h(Portal, null, {
          default: () =>
            h('div', { class: 't-combobox__positioner', ...api.value.getPositionerProps() }, [
              h(
                'ul',
                { class: 't-combobox__content', ...api.value.getContentProps() },
                collection.value.items.length === 0
                  ? [h('li', { role: 'presentation' }, 'No results')]
                  : collection.value.items.map((item) =>
                      h(
                        'li',
                        {
                          key: item.value,
                          class: 't-combobox__item',
                          ...api.value.getItemProps({ item }),
                        },
                        [h('span', api.value.getItemTextProps({ item }), item.label)],
                      ),
                    ),
              ),
            ]),
        }),
      ]);
  },
});
