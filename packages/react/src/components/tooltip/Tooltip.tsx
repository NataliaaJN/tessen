'use client';

import { tooltipVariants } from '@tessen-ui/core/contracts/tooltip';
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Portal } from '../../internal/portal.tsx';
import { useMergedRef } from '../../internal/use-controllable.ts';
import { TooltipContext, useTooltip, useTooltipRoot } from './tooltip.zag.ts';

export interface TooltipProps {
  /** Milliseconds before it opens on hover. Keyboard focus opens it right away. */
  openDelay?: number;
  /** Milliseconds before it closes after the pointer leaves. */
  closeDelay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  children?: ReactNode;
}

/** Renders no element of its own: it shares the tooltip state with its trigger and content. */
export function Tooltip({
  openDelay = 400,
  closeDelay = 150,
  placement = 'top',
  disabled = false,
  children,
}: TooltipProps) {
  const context = useTooltipRoot({ openDelay, closeDelay, placement, disabled });
  return <TooltipContext.Provider value={context}>{children}</TooltipContext.Provider>;
}

export type TooltipTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** A real button: it must be focusable so keyboard users can open the tooltip. */
export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  function TooltipTrigger({ className, ...rest }, ref) {
    const { api } = useTooltip();
    return (
      <button
        type="button"
        {...api.getTriggerProps()}
        {...rest}
        ref={ref}
        className={cx('t-tooltip__trigger', className)}
      />
    );
  },
);

export type TooltipContentProps = HTMLAttributes<HTMLDivElement>;

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent({ className, ...rest }, ref) {
    const { api, presence, placement } = useTooltip();
    const merged = useMergedRef(ref, presence.setNode);
    const resolved = tooltipVariants({ placement });
    return (
      <Portal>
        {(api.open || presence.present) && (
          <div className="t-tooltip__positioner" {...api.getPositionerProps()}>
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
