import { Stack, ToggleButton } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="3">
      <ToggleButton>Off</ToggleButton>
      <ToggleButton defaultPressed>On</ToggleButton>
    </Stack>
  );
}
