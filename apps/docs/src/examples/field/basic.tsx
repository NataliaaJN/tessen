import { Field, FieldLabel, FieldDescription, FieldError, Input, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack gap="4">
      <Field required>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" placeholder="you@example.com" />
        <FieldDescription>We never share it.</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>Name</FieldLabel>
        <Input defaultValue="x" />
        <FieldError>Too short</FieldError>
      </Field>
    </Stack>
  );
}
