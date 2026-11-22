import * as tabs from '@zag-js/tabs';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, useId, type PropType } from 'vue';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Public API: `items`, `v-model`, `defaultValue`, `orientation`; panel content in slots named after each value. */
export const Tabs = defineComponent({
  name: 'TTabs',
  props: {
    items: { type: Array as PropType<TabItem[]>, required: true },
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  emits: { 'update:modelValue': (value: string) => typeof value === 'string' },
  setup(props, { emit, slots }) {
    const id = useId();
    const service = useMachine(
      tabs.machine,
      computed(() => ({
        id,
        value: props.modelValue,
        defaultValue: props.defaultValue ?? props.items[0]?.value,
        orientation: props.orientation,
        onValueChange: (details: { value: string }) => emit('update:modelValue', details.value),
      })),
    );
    const api = computed(() => tabs.connect(service, normalizeProps));

    return () =>
      h('div', { class: 't-tabs', ...api.value.getRootProps() }, [
        h(
          'div',
          { class: 't-tabs__list', ...api.value.getListProps() },
          props.items.map((item) =>
            h(
              'button',
              {
                class: 't-tabs__tab',
                ...api.value.getTriggerProps({ value: item.value, disabled: item.disabled }),
              },
              item.label,
            ),
          ),
        ),
        ...props.items.map((item) =>
          h(
            'div',
            { class: 't-tabs__panel', ...api.value.getContentProps({ value: item.value }) },
            slots[item.value]?.(),
          ),
        ),
      ]);
  },
});
