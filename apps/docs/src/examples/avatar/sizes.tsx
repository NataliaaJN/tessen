import { Avatar, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="3" align="center">
      <Avatar name="Ada Lovelace" size="xs" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" shape="square" size="lg" />
      <Avatar name="Linus" size="xl" />
    </Stack>
  );
}
