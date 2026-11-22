'use client';

import { dropdownMenuVariants } from '@tessen-ui/core/contracts/dropdown-menu';
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Portal } from '../../internal/portal.tsx';
import { useMergedRef } from '../../internal/use-controllable.ts';
import { DropdownMenuContext, useDropdownMenu, useDropdownMenuRoot } from './dropdown-menu.zag.ts';

export interface DropdownMenuProps {
  open?: boolean;
  /** Initial state when `open` is not used. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Runs with the `value` of the item the person chose, before the menu closes. */
  onSelect?: (value: string) => void;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  children?: ReactNode;
}

/** Renders no element of its own: it shares the menu state with its parts. For actions, not navigation. */
export function DropdownMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  placement = 'bottom-start',
  children,
}: DropdownMenuProps) {
  const context = useDropdownMenuRoot({ open, defaultOpen, onOpenChange, onSelect, placement });
  return <DropdownMenuContext.Provider value={context}>{children}</DropdownMenuContext.Provider>;
}

export type DropdownMenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ className, ...rest }, ref) {
    const { api } = useDropdownMenu();
    return (
      <button
        type="button"
        {...api.getTriggerProps()}
        {...rest}
        ref={ref}
        className={cx('t-menu__trigger', className)}
      />
    );
  },
);

export type DropdownMenuContentProps = HTMLAttributes<HTMLDivElement>;

/** The list of items, rendered in a portal. Stays mounted until the exit ends. */
export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent({ className, ...rest }, ref) {
    const { api, presence } = useDropdownMenu();
    const merged = useMergedRef(ref, presence.setNode);
    const resolved = dropdownMenuVariants({});
    return (
      <Portal>
        {(api.open || presence.present) && (
          <div {...api.getPositionerProps()} className="t-menu__positioner">
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

export interface DropdownMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'value'> {
  /** Identifies the item in the root `onSelect`. */
  value: string;
  disabled?: boolean;
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ value, disabled, className, ...rest }, ref) {
    const { api } = useDropdownMenu();
    return (
      <div
        {...api.getItemProps({ value, disabled })}
        {...rest}
        ref={ref}
        className={cx('t-menu__item', className)}
      />
    );
  },
);

export type DropdownMenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  function DropdownMenuSeparator({ className, ...rest }, ref) {
    const { api } = useDropdownMenu();
    return (
      <div
        {...api.getSeparatorProps()}
        {...rest}
        ref={ref}
        className={cx('t-menu__separator', className)}
      />
    );
  },
);
