import { createApp, createSSRApp, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { Combobox, DatePicker, Dialog, Menu, Popover, Select, Tooltip } from '../src/vue/index.ts';
import {
  ACTIONS,
  FRUITS,
  track,
  type Adapter,
  type Handle,
  type Kind,
  type Props,
} from './adapter.ts';

const components: Record<Kind, Component> = {
  select: Select,
  combobox: Combobox,
  menu: Menu,
  popover: Popover,
  dialog: Dialog,
  tooltip: Tooltip,
  datepicker: DatePicker,
  nested: Dialog,
};

const defaults: Record<Kind, Props> = {
  select: { label: 'Fruit', items: FRUITS },
  combobox: { label: 'Fruit', items: FRUITS },
  menu: { items: ACTIONS },
  popover: { title: 'Details' },
  dialog: { title: 'Delete item', description: 'This cannot be undone.' },
  tooltip: { content: 'Save the file', openDelay: 0 },
  datepicker: { label: 'Date', defaultValue: '2026-11-15' },
  nested: { title: 'Settings' },
};

/** Neutral props -> Vue props and events. */
function vueProps(props: Props): Props {
  const out: Props = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === 'value') out.modelValue = value;
    else if (key === 'onValueChange') out['onUpdate:modelValue'] = value;
    else if (key === 'onOpenChange') out['onUpdate:open'] = value;
    else out[key] = value;
  }
  return out;
}

const root = (kind: Kind, props: Props = {}): Component => ({
  render: () =>
    h(components[kind], vueProps({ ...defaults[kind], ...props }), {
      trigger: () => 'Open',
      default: () =>
        kind === 'tooltip'
          ? 'Save'
          : kind === 'nested'
            ? h(Select, { label: 'Fruit', items: FRUITS })
            : h('button', { type: 'button' }, 'Inside'),
    }),
});

export const vueAdapter: Adapter = {
  name: 'vue',
  mount(kind, props) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(root(kind, props));
    app.mount(container);
    return track({ container, unmount: () => app.unmount() } satisfies Handle);
  },
  async hydrate(kind, props) {
    const html = await renderToString(createSSRApp(root(kind, props)));
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);

    const messages: string[] = [];
    const warn = console.warn;
    const error = console.error;
    console.warn = (...args) => void messages.push(args.join(' '));
    console.error = (...args) => void messages.push(args.join(' '));
    const app = createSSRApp(root(kind, props));
    try {
      app.mount(container);
    } finally {
      console.warn = warn;
      console.error = error;
    }
    return { ...track({ container, unmount: () => app.unmount() }), messages };
  },
};
