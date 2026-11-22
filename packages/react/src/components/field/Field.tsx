'use client';

import { fieldVariants, type FieldVariantProps } from '@tessen-ui/core/contracts/field';
import { forwardRef, useId, useMemo, type HTMLAttributes, type LabelHTMLAttributes } from 'react';
import { FieldContext, useField } from '../../internal/field-context.ts';
import { cx } from '../../internal/cx.ts';

export interface FieldProps
  extends FieldVariantProps, Omit<HTMLAttributes<HTMLDivElement>, keyof FieldVariantProps> {
  /** Base id for the control; label, description and error derive theirs from it. */
  id?: string;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { invalid, required, disabled, readOnly, id, className, ...rest },
  ref,
) {
  const uid = useId();
  const base = id ?? `t-field-${uid}`;
  const value = useMemo(
    () => ({
      id: base,
      labelId: `${base}-label`,
      descriptionId: `${base}-description`,
      errorId: `${base}-error`,
      invalid: !!invalid,
      required: !!required,
      disabled: !!disabled,
      readOnly: !!readOnly,
    }),
    [base, invalid, required, disabled, readOnly],
  );
  const resolved = fieldVariants({ invalid, required, disabled, readOnly });
  return (
    <FieldContext.Provider value={value}>
      <div {...rest} {...resolved.attrs} ref={ref} className={cx(resolved.class, className)} />
    </FieldContext.Provider>
  );
});

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(function FieldLabel(
  { children, className, ...rest },
  ref,
) {
  const field = useField();
  return (
    <label
      id={field?.labelId}
      htmlFor={field?.id}
      {...rest}
      ref={ref}
      className={cx('t-field__label', className)}
    >
      {children}
      {field?.required && (
        <span className="t-field__required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
});

export type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  function FieldDescription({ className, ...rest }, ref) {
    const field = useField();
    return (
      <p
        id={field?.descriptionId}
        {...rest}
        ref={ref}
        className={cx('t-field__description', className)}
      />
    );
  },
);

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement>;

/** Only present while the field is invalid: it is then announced as it appears. */
export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(function FieldError(
  { className, ...rest },
  ref,
) {
  const field = useField();
  if (!field?.invalid) return null;
  return (
    <p
      id={field.errorId}
      aria-live="polite"
      {...rest}
      ref={ref}
      className={cx('t-field__error', className)}
    />
  );
});
