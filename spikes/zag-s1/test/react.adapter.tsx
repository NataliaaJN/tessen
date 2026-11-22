import { flushSync } from 'react-dom';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { Dialog, Tabs, Tooltip } from '../src/react/index.ts';
import {
  TAB_ITEMS,
  track,
  type Adapter,
  type DialogOptions,
  type Handle,
  type Kind,
} from './adapter.ts';

function mount(element: ReactElement): Handle {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  flushSync(() => root.render(element));
  return track({ container, unmount: () => flushSync(() => root.unmount()) });
}

const dialogElement = (options: DialogOptions = {}) => (
  <Dialog title="Delete item" trigger="Open" {...options}>
    <button type="button">Inside</button>
  </Dialog>
);

const tabsElement = (
  props: { defaultValue?: string; onValueChange?: (v: string) => void } = {},
) => (
  <Tabs
    items={[...TAB_ITEMS]}
    panels={{ alpha: 'Alpha panel', beta: 'Beta panel', gamma: 'Gamma panel' }}
    {...props}
  />
);

const elements: Record<Kind, () => ReactElement> = {
  dialog: () => dialogElement({ description: 'This cannot be undone.' }),
  tabs: () => tabsElement(),
  tooltip: () => <Tooltip content="Save the file">Save</Tooltip>,
};

export const reactAdapter: Adapter = {
  name: 'react',
  dialog: (options) => mount(dialogElement(options)),
  tabs: (options) => mount(tabsElement(options)),
  tooltip: (options) =>
    mount(
      <Tooltip content="Save the file" {...options}>
        Save
      </Tooltip>,
    ),
  async hydrate(kind) {
    const container = document.createElement('div');
    container.innerHTML = renderToString(elements[kind]());
    document.body.append(container);

    const messages: string[] = [];
    const warn = console.warn;
    const error = console.error;
    console.warn = (...args) => void messages.push(args.join(' '));
    console.error = (...args) => void messages.push(args.join(' '));
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      flushSync(() => {
        root = hydrateRoot(container, elements[kind](), {
          onRecoverableError: (e) => void messages.push(String(e)),
        });
      });
    } finally {
      console.warn = warn;
      console.error = error;
    }
    return {
      ...track({ container, unmount: () => flushSync(() => root!.unmount()) }),
      messages,
    };
  },
};
