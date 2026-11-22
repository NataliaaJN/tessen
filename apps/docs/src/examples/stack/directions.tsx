import { Button, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack gap="4">
      <Stack direction="horizontal" gap="2">
        <Button>One</Button>
        <Button variant="outline">Two</Button>
      </Stack>
      <Stack gap="2">
        <Button variant="secondary">Three</Button>
        <Button variant="ghost">Four</Button>
      </Stack>
    </Stack>
  );
}
