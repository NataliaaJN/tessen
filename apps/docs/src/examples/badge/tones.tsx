import { Badge, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="2" wrap>
      <Badge tone="neutral">neutral</Badge>
      <Badge tone="brand">brand</Badge>
      <Badge tone="success">success</Badge>
      <Badge tone="warning">warning</Badge>
      <Badge tone="danger">danger</Badge>
      <Badge tone="info">info</Badge>
      <Badge variant="solid" tone="brand">solid</Badge>
      <Badge variant="outline" tone="success">outline</Badge>
    </Stack>
  );
}
