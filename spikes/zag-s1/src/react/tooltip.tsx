import * as tooltip from '@zag-js/tooltip';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId, type ReactNode } from 'react';
import { usePresence } from './use-presence.ts';

export interface TooltipProps {
  content: string;
  openDelay?: number;
  closeDelay?: number;
  /** Trigger label. */
  children?: ReactNode;
}

export function Tooltip({ content, openDelay = 400, closeDelay = 150, children }: TooltipProps) {
  const service = useMachine(tooltip.machine, { id: useId(), openDelay, closeDelay });
  const api = tooltip.connect(service, normalizeProps);
  const presence = usePresence(api.open);

  return (
    <>
      <button type="button" className="t-tooltip__trigger" {...api.getTriggerProps()}>
        {children}
      </button>
      {api.open || presence.present ? (
        <div className="t-tooltip__positioner" {...api.getPositionerProps()}>
          <div
            className="t-tooltip__content"
            ref={presence.setNode}
            {...api.getContentProps()}
            data-state={api.open ? 'open' : 'closed'}
            hidden={false}
          >
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
