import { createContext, useContext } from 'react';

/** State a `Field` shares with its label, description, error and control. */
export interface FieldContextValue {
  id: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

export const useField = () => useContext(FieldContext);

/**
 * Merges what the surrounding `Field` (if any) says about a control with the control's own props.
 * `aria-describedby` points at the description and, only while invalid, the error.
 */
export function useControlState(own: {
  invalid?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  id?: string | undefined;
  'aria-describedby'?: string | undefined;
}) {
  const field = useField();
  const describedBy = [
    own['aria-describedby'],
    field?.descriptionId,
    field?.invalid ? field.errorId : undefined,
  ]
    .filter(Boolean)
    .join(' ');
  return {
    id: own.id ?? field?.id,
    invalid: !!own.invalid || !!field?.invalid,
    disabled: !!own.disabled || !!field?.disabled,
    readOnly: !!own.readOnly || !!field?.readOnly,
    required: !!field?.required,
    describedBy: describedBy || undefined,
  };
}
