import * as tabs from '@zag-js/tabs';
import { normalizeProps, useMachine } from '@zag-js/react';
import { useId, type ReactNode } from 'react';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  /** Panel content by tab value. */
  panels: Record<string, ReactNode>;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  panels,
}: TabsProps) {
  const service = useMachine(tabs.machine, {
    id: useId(),
    value,
    defaultValue: defaultValue ?? items[0]?.value,
    orientation,
    onValueChange: (details) => onValueChange?.(details.value),
  });
  const api = tabs.connect(service, normalizeProps);

  return (
    <div className="t-tabs" {...api.getRootProps()}>
      <div className="t-tabs__list" {...api.getListProps()}>
        {items.map((item) => (
          <button
            key={item.value}
            className="t-tabs__tab"
            {...api.getTriggerProps({ value: item.value, disabled: item.disabled })}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          className="t-tabs__panel"
          {...api.getContentProps({ value: item.value })}
        >
          {panels[item.value]}
        </div>
      ))}
    </div>
  );
}
