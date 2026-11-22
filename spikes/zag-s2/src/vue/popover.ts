import * as popover from '@zag-js/popover';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, useId } from 'vue';
import { Portal, usePresence } from './shared.ts';

/** Public API: `title`, `v-model:open`; slots `trigger` and default. */
export const Popover = defineComponent({
  name: 'TPopover',
  props: {
    title: { type: String, required: true },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { emit, slots }) {
    const id = useId();
    const service = useMachine(
      popover.machine,
      computed(() => ({
        id,
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: (details: { open: boolean }) => emit('update:open', details.open),
      })),
    );
    const api = computed(() => popover.connect(service, normalizeProps));
    const presence = usePresence(computed(() => api.value.open));

    return () => [
      h(
        'button',
        { class: 't-popover__trigger', ...api.value.getTriggerProps() },
        slots.trigger?.(),
      ),
      h(Portal, null, {
        default: () =>
          api.value.open || presence.value.present
            ? h('div', { class: 't-popover__positioner', ...api.value.getPositionerProps() }, [
                h(
                  'div',
                  {
                    class: 't-popover__content',
                    ref: (el) => presence.value.setNode(el as HTMLElement | null),
                    ...api.value.getContentProps(),
                    'data-state': api.value.open ? 'open' : 'closed',
                    hidden: false,
                  },
                  [
                    h(
                      'h2',
                      { class: 't-popover__title', ...api.value.getTitleProps() },
                      props.title,
                    ),
                    slots.default?.(),
                    h(
                      'button',
                      { 'aria-label': 'Close', ...api.value.getCloseTriggerProps() },
                      'x',
                    ),
                  ],
                ),
              ])
            : null,
      }),
    ];
  },
});
