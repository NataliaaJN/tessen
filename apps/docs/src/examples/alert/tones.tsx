import { Alert, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack gap="2">
      <Alert tone="info" title="Heads up">
        Something you should know.
      </Alert>
      <Alert tone="success" title="Saved">
        Your changes are live.
      </Alert>
      <Alert tone="warning" title="Careful">
        This affects other people.
      </Alert>
      <Alert tone="danger" title="Failed">
        We could not save.
      </Alert>
    </Stack>
  );
}
