import { Field, FieldLabel, Textarea } from '@tessen-ui/react';

export default function Example() {
  return (
    <Field>
      <FieldLabel>Notes</FieldLabel>
      <Textarea placeholder="Anything we should know?" />
    </Field>
  );
}
