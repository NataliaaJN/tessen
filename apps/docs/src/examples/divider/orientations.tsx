import { Divider, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <div>
      <p>Above</p>
      <Divider />
      <Stack direction="horizontal" gap="3" align="center">
        <span>One</span>
        <Divider orientation="vertical" style={{ blockSize: 24 }} />
        <span>Two</span>
      </Stack>
    </div>
  );
}
