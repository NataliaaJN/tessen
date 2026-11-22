import { Combobox } from '@tessen-ui/react';

const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

export default function Example() {
  return (
    <Combobox label="Search fruit" items={items} placeholder="Type to filter" />
  );
}
