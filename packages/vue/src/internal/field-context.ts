import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue';

/** State a `TField` shares with its label, description, error and control. */
export interface FieldContext {
  id: ComputedRef<string>;
  labelId: ComputedRef<string>;
  descriptionId: ComputedRef<string>;
  errorId: ComputedRef<string>;
  invalid: ComputedRef<boolean>;
  required: ComputedRef<boolean>;
  disabled: ComputedRef<boolean>;
  readOnly: ComputedRef<boolean>;
}

const fieldKey: InjectionKey<FieldContext> = Symbol('tessen-field');

export function provideField(context: FieldContext): void {
  provide(fieldKey, context);
}

export function useField(): FieldContext | null {
  return inject(fieldKey, null);
}

/**
 * Merges what the surrounding `TField` (if any) says about a control with the control's own props.
 * Ids follow the field: `aria-describedby` points at the description and, only while invalid, the error.
 */
export function useControlState(own: {
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
}) {
  const field = useField();
  return {
    field,
    id: computed(() => own.id ?? field?.id.value),
    invalid: computed(() => !!own.invalid || !!field?.invalid.value),
    disabled: computed(() => !!own.disabled || !!field?.disabled.value),
    readOnly: computed(() => !!own.readOnly || !!field?.readOnly.value),
    required: computed(() => !!field?.required.value),
    describedBy: computed(() => {
      if (!field) return undefined;
      return [field.descriptionId.value, field.invalid.value ? field.errorId.value : '']
        .filter(Boolean)
        .join(' ');
    }),
  };
}
