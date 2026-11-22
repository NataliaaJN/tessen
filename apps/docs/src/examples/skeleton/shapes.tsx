import { Skeleton, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack gap="2">
      <Skeleton style={{ inlineSize: 240, blockSize: 16 }} />
      <Skeleton shape="circle" style={{ inlineSize: 40, blockSize: 40 }} />
    </Stack>
  );
}
