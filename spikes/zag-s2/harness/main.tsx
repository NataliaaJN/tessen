import { createRoot } from 'react-dom/client';
import { createApp, h, ref } from 'vue';
import * as R from '../src/react/index.ts';
import * as V from '../src/vue/index.ts';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];
const actions = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate', disabled: true },
  { value: 'delete', label: 'Delete' },
];

createApp({
  setup() {
    const value = ref<string | null>('apple');
    const date = ref<string | null>('2026-11-15');
    return () => [
      h(
        'div',
        h(V.Combobox, {
          label: 'Fruit (selected)',
          items: fruits,
          modelValue: value.value,
          'onUpdate:modelValue': (v: string | null) => (value.value = v),
        }),
      ),
      h('div', h(V.Combobox, { label: 'Fruit (empty)', items: fruits })),
      h('div', h(V.Select, { label: 'Select', items: fruits })),
      h('div', h(V.Menu, { items: actions }, { trigger: () => 'Menu' })),
      h(
        'div',
        h(V.Popover, { title: 'Popover' }, { trigger: () => 'Popover', default: () => 'Body' }),
      ),
      h(
        'div',
        h(
          V.Dialog,
          { title: 'Dialog' },
          {
            trigger: () => 'Dialog',
            default: () => h(V.Select, { label: 'Fruit in dialog', items: fruits }),
          },
        ),
      ),
      h('div', h(V.Tooltip, { content: 'Tip', openDelay: 100 }, { default: () => 'Tooltip' })),
      h(
        'div',
        h(V.DatePicker, {
          label: 'Date',
          modelValue: date.value,
          'onUpdate:modelValue': (v: string | null) => (date.value = v),
          disabledDates: ['2026-11-20'],
        }),
      ),
    ];
  },
}).mount('#vue');

import { useState } from 'react';
function ReactApp() {
  const [value, setValue] = useState<string | null>('apple');
  const [date, setDate] = useState<string | null>('2026-11-15');
  return (
    <>
      <div>
        <R.Combobox
          label="Fruit (selected)"
          items={fruits}
          value={value}
          onValueChange={setValue}
        />
      </div>
      <div>
        <R.Combobox label="Fruit (empty)" items={fruits} />
      </div>
      <div>
        <R.Select label="Select" items={fruits} />
      </div>
      <div>
        <R.Menu trigger="Menu" items={actions} />
      </div>
      <div>
        <R.Popover trigger="Popover" title="Popover">
          Body
        </R.Popover>
      </div>
      <div>
        <R.Dialog trigger="Dialog" title="Dialog">
          <R.Select label="Fruit in dialog" items={fruits} />
        </R.Dialog>
      </div>
      <div>
        <R.Tooltip content="Tip" openDelay={100}>
          Tooltip
        </R.Tooltip>
      </div>
      <div>
        <R.DatePicker
          label="Date"
          value={date}
          onValueChange={setDate}
          disabledDates={['2026-11-20']}
        />
      </div>
    </>
  );
}
createRoot(document.getElementById('react')!).render(<ReactApp />);
