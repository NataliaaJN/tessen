import * as menu from '@zag-js/menu';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId, type ReactNode } from 'react';
import { Portal, type Item } from './shared.tsx';

export interface MenuProps {
  /** Label of the button that opens the menu. */
  trigger: ReactNode;
  items: Item[];
  onSelect?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Menu({ trigger, items, onSelect, open, defaultOpen, onOpenChange }: MenuProps) {
  const service = useMachine(menu.machine, {
    id: useId(),
    open,
    defaultOpen,
    onSelect: (details) => onSelect?.(details.value),
    onOpenChange: (details) => onOpenChange?.(details.open),
  });
  const api = menu.connect(service, normalizeProps);

  return (
    <>
      <button className="t-menu__trigger" {...api.getTriggerProps()}>
        {trigger}
      </button>
      <Portal>
        <div className="t-menu__positioner" {...api.getPositionerProps()}>
          <ul className="t-menu__content" {...api.getContentProps()}>
            {items.map((item) => (
              <li
                key={item.value}
                className="t-menu__item"
                {...api.getItemProps({ value: item.value, disabled: item.disabled })}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </>
  );
}
