import { Switch, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="4">
      <Switch>Off</Switch>
      <Switch defaultChecked>On</Switch>
      <Switch disabled>Disabled</Switch>
    </Stack>
  );
}
