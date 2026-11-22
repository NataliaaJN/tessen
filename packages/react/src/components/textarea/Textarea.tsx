'use client';

import { textareaVariants, type TextareaVariantProps } from '@tessen-ui/core/contracts/textarea';
import { forwardRef, type ChangeEvent, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlState } from '../../internal/field-context.ts';

export interface TextareaProps
  extends TextareaVariantProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Receives the new value on every change (next to the native `onChange`). */
  onValueChange?: (value: string) => void;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size, invalid, onValueChange, onChange, className, disabled, readOnly, id, ...rest },
  ref,
) {
  const state = useControlState({
    invalid,
    disabled,
    readOnly,
    id,
    'aria-describedby': rest['aria-describedby'],
  });
  const resolved = textareaVariants({ size, invalid: state.invalid });
  return (
    <textarea
      {...rest}
      {...resolved.attrs}
      ref={ref}
      id={state.id}
      className={cx(resolved.class, className)}
      disabled={state.disabled}
      readOnly={state.readOnly}
      required={state.required || rest.required}
      aria-invalid={state.invalid || undefined}
      aria-describedby={state.describedBy}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
      }}
    />
  );
});
