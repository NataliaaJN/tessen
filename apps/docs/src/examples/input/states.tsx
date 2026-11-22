import { Input, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack gap="3" style={{ maxInlineSize: '20rem' }}>
      <Input aria-label="Email" type="email" placeholder="you@example.com" />
      <Input aria-label="Small" size="sm" defaultValue="Small" />
      <Input aria-label="Invalid" invalid defaultValue="Wrong" />
      <Input aria-label="Disabled" disabled defaultValue="Disabled" />
    </Stack>
  );
}
