import { createApp, createSSRApp, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { Dialog, Tabs, Tooltip } from '../src/vue/index.ts';
import { TAB_ITEMS, track, type Adapter, type Handle, type Kind } from './adapter.ts';

function mount(create: typeof createApp, root: Component): Handle {
  const container = document.createElement('div');
  document.body.append(container);
  const app = create(root);
  app.mount(container);
  return track({ container, unmount: () => app.unmount() });
}

const dialogRoot = (props: Record<string, unknown> = {}) => ({
  render: () =>
    h(
      Dialog,
      { title: 'Delete item', ...props },
      { trigger: () => 'Open', default: () => h('button', { type: 'button' }, 'Inside') },
    ),
});

const tabsRoot = (props: Record<string, unknown> = {}) => ({
  render: () =>
    h(
      Tabs,
      { items: [...TAB_ITEMS], ...props },
      {
        alpha: () => 'Alpha panel',
        beta: () => 'Beta panel',
        gamma: () => 'Gamma panel',
      },
    ),
});

const tooltipRoot = (props: Record<string, unknown> = {}) => ({
  render: () => h(Tooltip, { content: 'Save the file', ...props }, { default: () => 'Save' }),
});

const roots: Record<Kind, () => Component> = {
  dialog: () => dialogRoot({ description: 'This cannot be undone.' }),
  tabs: () => tabsRoot(),
  tooltip: () => tooltipRoot(),
};

export const vueAdapter: Adapter = {
  name: 'vue',
  dialog: ({ onOpenChange, ...rest } = {}) =>
    mount(createApp, dialogRoot({ ...rest, 'onUpdate:open': onOpenChange })),
  tabs: ({ onValueChange, ...rest } = {}) =>
    mount(createApp, tabsRoot({ ...rest, 'onUpdate:modelValue': onValueChange })),
  tooltip: (options = {}) => mount(createApp, tooltipRoot({ ...options })),
  async hydrate(kind) {
    const html = await renderToString(createSSRApp(roots[kind]()));
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);

    const messages: string[] = [];
    const warn = console.warn;
    const error = console.error;
    console.warn = (...args) => void messages.push(args.join(' '));
    console.error = (...args) => void messages.push(args.join(' '));
    const app = createSSRApp(roots[kind]());
    try {
      app.mount(container);
    } finally {
      console.warn = warn;
      console.error = error;
    }
    return { ...track({ container, unmount: () => app.unmount() }), messages };
  },
};
