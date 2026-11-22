import * as menu from '@zag-js/menu';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, useId, type PropType } from 'vue';
import { Portal, type Item } from './shared.ts';

/** Public API: `items`, `v-model:open`, event `select`; the `trigger` slot is the button label. */
export const Menu = defineComponent({
  name: 'TMenu',
  props: {
    items: { type: Array as PropType<Item[]>, required: true },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
  },
  emits: {
    select: (value: string) => typeof value === 'string',
    'update:open': (open: boolean) => typeof open === 'boolean',
  },
  setup(props, { emit, slots }) {
    const id = useId();
    const service = useMachine(
      menu.machine,
      computed(() => ({
        id,
        open: props.open,
        defaultOpen: props.defaultOpen,
        onSelect: (details: { value: string }) => emit('select', details.value),
        onOpenChange: (details: { open: boolean }) => emit('update:open', details.open),
      })),
    );
    const api = computed(() => menu.connect(service, normalizeProps));

    return () => [
      h('button', { class: 't-menu__trigger', ...api.value.getTriggerProps() }, slots.trigger?.()),
      h(Portal, null, {
        default: () =>
          h('div', { class: 't-menu__positioner', ...api.value.getPositionerProps() }, [
            h(
              'ul',
              { class: 't-menu__content', ...api.value.getContentProps() },
              props.items.map((item) =>
                h(
                  'li',
                  {
                    key: item.value,
                    class: 't-menu__item',
                    ...api.value.getItemProps({ value: item.value, disabled: item.disabled }),
                  },
                  item.label,
                ),
              ),
            ),
          ]),
      }),
    ];
  },
});
