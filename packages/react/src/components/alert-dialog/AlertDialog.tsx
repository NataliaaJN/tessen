'use client';

import type { AlertDialogVariantProps } from '@tessen-ui/core/contracts/alert-dialog';
import { buttonVariants, type ButtonVariantProps } from '@tessen-ui/core/contracts/button';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogTitleProps,
  type DialogTriggerProps,
} from '../dialog/index.ts';
import { useDialog } from '../../internal/dialog.zag.ts';

export interface AlertDialogProps {
  open?: boolean;
  /** Initial state when `open` is not used. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  children?: ReactNode;
}

/**
 * A modal that interrupts to ask for a decision. A `Dialog` with `role="alertdialog"` that a
 * click outside does not dismiss. Put the safe choice (`AlertDialogCancel`) first so it is the
 * first thing focus reaches.
 */
export function AlertDialog({ children, ...rest }: AlertDialogProps) {
  return (
    <Dialog {...rest} role="alertdialog" closeOnInteractOutside={false}>
      {children}
    </Dialog>
  );
}

export type AlertDialogTriggerProps = DialogTriggerProps;
export const AlertDialogTrigger = DialogTrigger;

export interface AlertDialogContentProps
  extends Omit<DialogContentProps, 'size'>, AlertDialogVariantProps {}

export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent({ size = 'sm', ...rest }, ref) {
    return <DialogContent {...rest} size={size} ref={ref} />;
  },
);

export type AlertDialogTitleProps = DialogTitleProps;
export const AlertDialogTitle = DialogTitle;

export type AlertDialogDescriptionProps = DialogDescriptionProps;
export const AlertDialogDescription = DialogDescription;

export interface AlertDialogButtonProps
  extends
    Pick<ButtonVariantProps, 'size' | 'tone'>,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {}

/** Dismisses without doing anything: the safe choice. */
export const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogButtonProps>(
  function AlertDialogCancel({ size, tone, className, ...rest }, ref) {
    const { api } = useDialog();
    const resolved = buttonVariants({ variant: 'outline', size, tone });
    return (
      <button
        type="button"
        {...api.getCloseTriggerProps()}
        {...rest}
        {...resolved.attrs}
        ref={ref}
        className={cx(resolved.class, 't-alert-dialog__cancel', className)}
      />
    );
  },
);

/** Confirms. It closes the dialog; run the work in `onClick`. Use `tone="danger"` when destructive. */
export const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogButtonProps>(
  function AlertDialogAction({ size, tone, className, ...rest }, ref) {
    const { api } = useDialog();
    const resolved = buttonVariants({ variant: 'primary', size, tone });
    return (
      <button
        type="button"
        {...api.getCloseTriggerProps()}
        {...rest}
        {...resolved.attrs}
        ref={ref}
        className={cx(resolved.class, 't-alert-dialog__action', className)}
      />
    );
  },
);
