'use client';

import { dialogVariants, type DialogVariantProps } from '@tessen-ui/core/contracts/dialog';
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Portal } from '../../internal/portal.tsx';
import { useMergedRef } from '../../internal/use-controllable.ts';
import { DialogContext, useDialog, useDialogRoot } from '../../internal/dialog.zag.ts';

export interface DialogProps {
  open?: boolean;
  /** Initial state when `open` is not used. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `false`: no focus trap and the rest of the page stays reachable. */
  modal?: boolean;
  /** `alertdialog` asks for a decision and is not dismissed by clicking outside. */
  role?: 'dialog' | 'alertdialog';
  closeOnEscape?: boolean;
  closeOnInteractOutside?: boolean;
  children?: ReactNode;
}

/** Renders no element of its own: it shares the dialog state with its parts. */
export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  role = 'dialog',
  closeOnEscape = true,
  closeOnInteractOutside,
  children,
}: DialogProps) {
  const context = useDialogRoot({
    open,
    defaultOpen,
    onOpenChange,
    modal,
    role,
    closeOnEscape,
    closeOnInteractOutside,
  });
  return <DialogContext.Provider value={context}>{children}</DialogContext.Provider>;
}

export type DialogTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ className, ...rest }, ref) {
    const { api } = useDialog();
    return (
      <button
        type="button"
        {...api.getTriggerProps()}
        {...rest}
        ref={ref}
        className={cx('t-dialog__trigger', className)}
      />
    );
  },
);

export interface DialogContentProps extends DialogVariantProps, HTMLAttributes<HTMLDivElement> {}

/** Backdrop, positioner and content, rendered in a portal. Stays mounted until the exit ends. */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { size, className, ...rest },
  ref,
) {
  const { api, presence } = useDialog();
  const merged = useMergedRef(ref, presence.setNode);
  const resolved = dialogVariants({ size });
  const state = api.open ? 'open' : 'closed';
  return (
    <Portal>
      {(api.open || presence.present) && (
        <div {...resolved.attrs} className={resolved.class} data-state={state}>
          <div className="t-dialog__backdrop" {...api.getBackdropProps()} />
          <div className="t-dialog__positioner" {...api.getPositionerProps()}>
            <div
              {...api.getContentProps()}
              {...rest}
              ref={merged}
              className={cx('t-dialog__content', className)}
              data-state={state}
              hidden={false}
            />
          </div>
        </div>
      )}
    </Portal>
  );
});

export type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { className, ...rest },
  ref,
) {
  const { api } = useDialog();
  return (
    <h2 {...api.getTitleProps()} {...rest} ref={ref} className={cx('t-dialog__title', className)} />
  );
});

export type DialogDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...rest }, ref) {
    const { api } = useDialog();
    return (
      <p
        {...api.getDescriptionProps()}
        {...rest}
        ref={ref}
        className={cx('t-dialog__description', className)}
      />
    );
  },
);

export type DialogCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { className, ...rest },
  ref,
) {
  const { api } = useDialog();
  return (
    <button
      type="button"
      {...api.getCloseTriggerProps()}
      {...rest}
      ref={ref}
      className={cx('t-dialog__close', className)}
    />
  );
});
