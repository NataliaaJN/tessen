import { Progress, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack gap="4" style={{ maxInlineSize: '24rem' }}>
      <Progress aria-label="Upload" value={40} />
      <Progress aria-label="Busy" tone="success" size="lg" />
      <Progress aria-label="Almost full" tone="danger" size="sm" value={90} />
    </Stack>
  );
}
