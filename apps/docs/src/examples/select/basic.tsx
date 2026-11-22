import { Select } from '@tessen-ui/react';

const items = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

export default function Example() {
  return (
    <Select label="Fruit" items={items} defaultValue="cherry" />
  );
}
