import { Button } from '@tessen-ui/react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button tone="danger">Danger</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
