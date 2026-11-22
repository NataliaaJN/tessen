import * as popover from '@zag-js/popover';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId, type ReactNode } from 'react';
import { Portal, usePresence } from './shared.tsx';

export interface PopoverProps {
  trigger: ReactNode;
  title: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function Popover({
  trigger,
  title,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: PopoverProps) {
  const service = useMachine(popover.machine, {
    id: useId(),
    open,
    defaultOpen,
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  const api = popover.connect(service, normalizeProps);
  const presence = usePresence(api.open);

  return (
    <>
      <button className="t-popover__trigger" {...api.getTriggerProps()}>
        {trigger}
      </button>
      <Portal>
        {api.open || presence.present ? (
          <div className="t-popover__positioner" {...api.getPositionerProps()}>
            <div
              className="t-popover__content"
              ref={presence.setNode}
              {...api.getContentProps()}
              data-state={api.open ? 'open' : 'closed'}
              hidden={false}
            >
              <h2 className="t-popover__title" {...api.getTitleProps()}>
                {title}
              </h2>
              {children}
              <button aria-label="Close" {...api.getCloseTriggerProps()}>
                x
              </button>
            </div>
          </div>
        ) : null}
      </Portal>
    </>
  );
}
