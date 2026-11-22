import { createElement, type ComponentType, type ReactElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import {
  Combobox,
  DatePicker,
  Dialog,
  Menu,
  Popover,
  Select,
  Tooltip,
} from '../src/react/index.ts';
import {
  ACTIONS,
  FRUITS,
  track,
  type Adapter,
  type Handle,
  type Kind,
  type Props,
} from './adapter.ts';

const components = {
  select: Select,
  combobox: Combobox,
  menu: Menu,
  popover: Popover,
  dialog: Dialog,
  tooltip: Tooltip,
  datepicker: DatePicker,
  nested: Dialog,
} as unknown as Record<Kind, ComponentType<Props>>;

const defaults: Record<Kind, Props> = {
  select: { label: 'Fruit', items: FRUITS },
  combobox: { label: 'Fruit', items: FRUITS },
  menu: { items: ACTIONS, trigger: 'Open' },
  popover: { title: 'Details', trigger: 'Open' },
  dialog: { title: 'Delete item', description: 'This cannot be undone.', trigger: 'Open' },
  tooltip: { content: 'Save the file', openDelay: 0 },
  datepicker: { label: 'Date', defaultValue: '2026-11-15' },
  nested: { title: 'Settings', trigger: 'Open' },
};

const element = (kind: Kind, props: Props = {}): ReactElement =>
  createElement(
    components[kind],
    { ...defaults[kind], ...props },
    kind === 'tooltip'
      ? 'Save'
      : kind === 'nested'
        ? createElement(Select as unknown as ComponentType<Props>, {
            label: 'Fruit',
            items: FRUITS,
          })
        : createElement('button', { type: 'button' }, 'Inside'),
  );

export const reactAdapter: Adapter = {
  name: 'react',
  mount(kind, props) {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    flushSync(() => root.render(element(kind, props)));
    return track({ container, unmount: () => flushSync(() => root.unmount()) } satisfies Handle);
  },
  async hydrate(kind, props) {
    const container = document.createElement('div');
    container.innerHTML = renderToString(element(kind, props));
    document.body.append(container);

    const messages: string[] = [];
    const warn = console.warn;
    const error = console.error;
    console.warn = (...args) => void messages.push(args.join(' '));
    console.error = (...args) => void messages.push(args.join(' '));
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      flushSync(() => {
        root = hydrateRoot(container, element(kind, props), {
          onRecoverableError: (e) => void messages.push(String(e)),
        });
      });
    } finally {
      console.warn = warn;
      console.error = error;
    }
    return { ...track({ container, unmount: () => flushSync(() => root!.unmount()) }), messages };
  },
};
