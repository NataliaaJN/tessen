import { createRoot } from 'react-dom/client';
import { createApp, h } from 'vue';
import {
  Dialog as ReactDialog,
  Tabs as ReactTabs,
  Tooltip as ReactTooltip,
} from '../src/react/index.ts';
import { Dialog as VueDialog, Tabs as VueTabs, Tooltip as VueTooltip } from '../src/vue/index.ts';

const items = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta', disabled: true },
  { value: 'gamma', label: 'Gamma' },
];

createApp({
  render: () => [
    h(
      VueTabs,
      { items },
      { alpha: () => 'Alpha panel', beta: () => 'Beta panel', gamma: () => 'Gamma panel' },
    ),
    h(
      VueDialog,
      { title: 'Delete item', description: 'This cannot be undone.' },
      {
        trigger: () => 'Open dialog',
        default: () => h('button', { type: 'button' }, 'Inside'),
      },
    ),
    h(VueTooltip, { content: 'Save the file', openDelay: 100 }, { default: () => 'Save' }),
  ],
}).mount('#vue');

createRoot(document.getElementById('react')!).render(
  <>
    <ReactTabs
      items={items}
      panels={{ alpha: 'Alpha panel', beta: 'Beta panel', gamma: 'Gamma panel' }}
    />
    <ReactDialog title="Delete item" description="This cannot be undone." trigger="Open dialog">
      <button type="button">Inside</button>
    </ReactDialog>
    <ReactTooltip content="Save the file" openDelay={100}>
      Save
    </ReactTooltip>
  </>,
);
