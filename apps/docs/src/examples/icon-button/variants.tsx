import { IconButton, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="3" align="center">
      <IconButton label="Close">×</IconButton>
      <IconButton label="Close" variant="ghost" size="sm">×</IconButton>
      <IconButton label="Delete" variant="outline" tone="danger">×</IconButton>
    </Stack>
  );
}
