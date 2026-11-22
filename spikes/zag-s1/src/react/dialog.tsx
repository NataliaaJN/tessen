import * as dialog from '@zag-js/dialog';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId, type ReactNode } from 'react';
import { usePresence } from './use-presence.ts';

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  title: string;
  description?: string;
  /** Content of the trigger button. */
  trigger: ReactNode;
  children?: ReactNode;
}

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  title,
  description,
  trigger,
  children,
}: DialogProps) {
  const service = useMachine(dialog.machine, {
    id: useId(),
    open,
    defaultOpen,
    modal,
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  const api = dialog.connect(service, normalizeProps);
  const presence = usePresence(api.open);
  const state = api.open ? 'open' : 'closed';

  return (
    <>
      <button className="t-button" {...api.getTriggerProps()}>
        {trigger}
      </button>
      {api.open || presence.present ? (
        <div className="t-dialog" data-state={state}>
          <div className="t-dialog__backdrop" {...api.getBackdropProps()} />
          <div className="t-dialog__positioner" {...api.getPositionerProps()}>
            <div
              className="t-dialog__content"
              ref={presence.setNode}
              {...api.getContentProps()}
              data-state={state}
              hidden={false}
            >
              <h2 className="t-dialog__title" {...api.getTitleProps()}>
                {title}
              </h2>
              {description ? (
                <p className="t-dialog__description" {...api.getDescriptionProps()}>
                  {description}
                </p>
              ) : null}
              {children}
              <button
                className="t-dialog__close"
                aria-label="Close"
                {...api.getCloseTriggerProps()}
              >
                x
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
