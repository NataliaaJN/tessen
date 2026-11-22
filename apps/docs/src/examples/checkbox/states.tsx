import { Checkbox, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="4">
      <Checkbox>Plain</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Mixed</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
    </Stack>
  );
}
