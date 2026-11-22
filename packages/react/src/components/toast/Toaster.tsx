'use client';

import { toastVariants } from '@tessen-ui/core/contracts/toast';
import type { HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { Portal } from '../../internal/portal.tsx';
import {
  createToaster,
  useToastItem,
  useToasterRoot,
  type GroupService,
  type ToastItemProps,
  type ToastOptions,
  type ToastPlacement,
  type ToastType,
  type Toaster as ToasterHandle,
  type ToasterOptions,
} from './toast.zag.ts';

export { createToaster };
export type { ToastOptions, ToastPlacement, ToastType, ToasterHandle, ToasterOptions };

export interface ToasterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The handle made once with `createToaster()`; call it from anywhere to show a toast. */
  toaster: ToasterHandle;
  /** Accessible name of the notifications region. */
  label?: string;
}

/** Mount it once near the root of the app. It renders the region that holds every toast. */
export function Toaster({ toaster, label = 'Notifications', className, ...rest }: ToasterProps) {
  const { service, api } = useToasterRoot(toaster);
  return (
    <Portal>
      <div {...api.getGroupProps({ label })} {...rest} className={cx('t-toaster', className)}>
        {api.getToasts().map((item, index) => (
          <ToastItem key={item.id} item={item} parent={service} index={index} />
        ))}
      </div>
    </Portal>
  );
}

function ToastItem({
  item,
  parent,
  index,
}: {
  item: ToastItemProps;
  parent: GroupService;
  index: number;
}) {
  const api = useToastItem(item, parent, index);
  const resolved = toastVariants({
    type: (['info', 'success', 'warning', 'error', 'loading'] as const).find(
      (type) => type === api.type,
    ),
  });
  return (
    <div {...api.getRootProps()} className={resolved.class}>
      <div {...api.getGhostBeforeProps()} />
      <div className="t-toast__body">
        {api.title && (
          <div {...api.getTitleProps()} className="t-toast__title">
            {api.title}
          </div>
        )}
        {api.description && (
          <div {...api.getDescriptionProps()} className="t-toast__description">
            {api.description}
          </div>
        )}
      </div>
      {item.action && (
        <button {...api.getActionTriggerProps()} className="t-toast__action">
          {item.action.label}
        </button>
      )}
      {api.closable && (
        <button {...api.getCloseTriggerProps()} className="t-toast__close">
          <span aria-hidden="true">×</span>
        </button>
      )}
      <div {...api.getGhostAfterProps()} />
    </div>
  );
}
