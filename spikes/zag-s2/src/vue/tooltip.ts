import * as tooltip from '@zag-js/tooltip';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, defineComponent, h, useId } from 'vue';
import { Portal, usePresence } from './shared.ts';

/** Public API: `content`, `openDelay`, `closeDelay`; the default slot is the trigger label. */
export const Tooltip = defineComponent({
  name: 'TTooltip',
  props: {
    content: { type: String, required: true },
    openDelay: { type: Number, default: 400 },
    closeDelay: { type: Number, default: 150 },
  },
  setup(props, { slots }) {
    const id = useId();
    const service = useMachine(
      tooltip.machine,
      computed(() => ({ id, openDelay: props.openDelay, closeDelay: props.closeDelay })),
    );
    const api = computed(() => tooltip.connect(service, normalizeProps));
    const presence = usePresence(computed(() => api.value.open));

    return () => [
      h(
        'button',
        { type: 'button', class: 't-tooltip__trigger', ...api.value.getTriggerProps() },
        slots.default?.(),
      ),
      h(Portal, null, {
        default: () =>
          api.value.open || presence.value.present
            ? h('div', { class: 't-tooltip__positioner', ...api.value.getPositionerProps() }, [
                h(
                  'div',
                  {
                    class: 't-tooltip__content',
                    ref: (el) => presence.value.setNode(el as HTMLElement | null),
                    ...api.value.getContentProps(),
                    'data-state': api.value.open ? 'open' : 'closed',
                    hidden: false,
                  },
                  props.content,
                ),
              ])
            : null,
      }),
    ];
  },
});
