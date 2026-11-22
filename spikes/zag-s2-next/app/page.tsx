'use client';

import {
  Combobox,
  DatePicker,
  Dialog,
  Menu,
  Popover,
  Select,
  Tooltip,
} from '@tessen-ui/spike-zag-s2/react';
import { useState } from 'react';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];
const actions = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate', disabled: true },
  { value: 'delete', label: 'Delete' },
];

export default function Page() {
  const [fruit, setFruit] = useState<string | null>('cherry');
  const [day, setDay] = useState<string | null>('2026-11-15');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState('');
  return (
    <main>
      <h1>Next</h1>
      <p id="fruit-state">
        fruit={fruit} day={day} dialogOpen={String(dialogOpen)} menu={selected}
      </p>
      <div>
        <Select label="Fruit" items={fruits} value={fruit} onValueChange={setFruit} />
      </div>
      <div>
        <Combobox label="Fruit search" items={fruits} value={fruit} onValueChange={setFruit} />
      </div>
      <div>
        <Menu trigger="Actions" items={actions} onSelect={setSelected} />
      </div>
      <div>
        <Popover trigger="Popover" title="Popover">
          Body
        </Popover>
      </div>
      <div>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          trigger="Open dialog"
          title="Dialog"
          description="Described"
        >
          <button type="button">Inside</button>
        </Dialog>
      </div>
      <div>
        <Tooltip content="Save the file">Save</Tooltip>
      </div>
      <div>
        <DatePicker
          label="Date"
          value={day}
          onValueChange={setDay}
          disabledDates={['2026-11-20']}
        />
      </div>
    </main>
  );
}
