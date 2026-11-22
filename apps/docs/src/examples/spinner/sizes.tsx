import { Spinner, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="4" align="center">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" label="Saving" />
    </Stack>
  );
}
