import * as dialog from '@zag-js/dialog';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, useId } from 'vue';
import { Portal, usePresence } from './shared.ts';

/** Public API: `title`, `description`, `v-model:open`; slots `trigger` and default. */
export const Dialog = defineComponent({
  name: 'TDialog',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { emit, slots }) {
    const id = useId();
    const service = useMachine(
      dialog.machine,
      computed(() => ({
        id,
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: (details: { open: boolean }) => emit('update:open', details.open),
      })),
    );
    const api = computed(() => dialog.connect(service, normalizeProps));
    const presence = usePresence(computed(() => api.value.open));
    const state = () => (api.value.open ? 'open' : 'closed');

    return () => [
      h('button', { class: 't-button', ...api.value.getTriggerProps() }, slots.trigger?.()),
      h(Portal, null, {
        default: () =>
          api.value.open || presence.value.present
            ? h('div', { class: 't-dialog', 'data-state': state() }, [
                h('div', { class: 't-dialog__backdrop', ...api.value.getBackdropProps() }),
                h('div', { class: 't-dialog__positioner', ...api.value.getPositionerProps() }, [
                  h(
                    'div',
                    {
                      class: 't-dialog__content',
                      ref: (el) => presence.value.setNode(el as HTMLElement | null),
                      ...api.value.getContentProps(),
                      'data-state': state(),
                      hidden: false,
                    },
                    [
                      h('h2', api.value.getTitleProps(), props.title),
                      props.description
                        ? h('p', api.value.getDescriptionProps(), props.description)
                        : null,
                      slots.default?.(),
                      h(
                        'button',
                        { 'aria-label': 'Close', ...api.value.getCloseTriggerProps() },
                        'x',
                      ),
                    ],
                  ),
                ]),
              ])
            : null,
      }),
    ];
  },
});
