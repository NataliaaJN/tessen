import { Field, FieldLabel, NativeSelect } from '@tessen-ui/react';

export default function Example() {
  return (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <NativeSelect defaultValue="fr">
        <option value="es">Spain</option>
        <option value="fr">France</option>
      </NativeSelect>
    </Field>
  );
}
