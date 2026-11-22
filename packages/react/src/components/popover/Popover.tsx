'use client';

import { popoverVariants } from '@tessen-ui/core/contracts/popover';
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Portal } from '../../internal/portal.tsx';
import { useMergedRef } from '../../internal/use-controllable.ts';
import { PopoverContext, usePopover, usePopoverRoot } from './popover.zag.ts';

export interface PopoverProps {
  open?: boolean;
  /** Initial state when `open` is not used. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  closeOnEscape?: boolean;
  closeOnInteractOutside?: boolean;
  children?: ReactNode;
}

/** Renders no element of its own: it shares the popover state with its parts. */
export function Popover({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  closeOnEscape = true,
  closeOnInteractOutside = true,
  children,
}: PopoverProps) {
  const context = usePopoverRoot({
    open,
    defaultOpen,
    onOpenChange,
    placement,
    closeOnEscape,
    closeOnInteractOutside,
  });
  return <PopoverContext.Provider value={context}>{children}</PopoverContext.Provider>;
}

export type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger({ className, ...rest }, ref) {
    const { api } = usePopover();
    return (
      <button
        type="button"
        {...api.getTriggerProps()}
        {...rest}
        ref={ref}
        className={cx('t-popover__trigger', className)}
      />
    );
  },
);

export type PopoverContentProps = HTMLAttributes<HTMLDivElement>;

/** A non-modal dialog next to the trigger, rendered in a portal. Stays mounted until the exit ends. */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent({ className, ...rest }, ref) {
    const { api, presence, placement } = usePopover();
    const merged = useMergedRef(ref, presence.setNode);
    const resolved = popoverVariants({ placement });
    return (
      <Portal>
        {(api.open || presence.present) && (
          <div {...api.getPositionerProps()} className="t-popover__positioner">
            <div
              {...api.getContentProps()}
              {...rest}
              {...resolved.attrs}
              ref={merged}
              className={cx(resolved.class, className)}
              data-state={api.open ? 'open' : 'closed'}
              hidden={false}
            />
          </div>
        )}
      </Portal>
    );
  },
);

export type PopoverTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(function PopoverTitle(
  { className, ...rest },
  ref,
) {
  const { api } = usePopover();
  return (
    <h2
      {...api.getTitleProps()}
      {...rest}
      ref={ref}
      className={cx('t-popover__title', className)}
    />
  );
});

export type PopoverDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const PopoverDescription = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  function PopoverDescription({ className, ...rest }, ref) {
    const { api } = usePopover();
    return (
      <p
        {...api.getDescriptionProps()}
        {...rest}
        ref={ref}
        className={cx('t-popover__description', className)}
      />
    );
  },
);

export type PopoverCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(
  { className, ...rest },
  ref,
) {
  const { api } = usePopover();
  return (
    <button
      type="button"
      {...api.getCloseTriggerProps()}
      {...rest}
      ref={ref}
      className={cx('t-popover__close', className)}
    />
  );
});
