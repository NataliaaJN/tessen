import type { Adapter } from '@tessen-ui/contract-runner';
import type { NeutralProps } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { createElement, type ComponentType } from 'react';

export interface ReactAdapterOptions {
  /** Where the neutral `label` goes: `children` (default), the `label` prop, or nowhere. */
  labelAs?: 'children' | 'prop' | 'none';
  /** Where the neutral `leading` goes: the `leadingIcon` prop (default) or `children`. */
  leadingAs?: 'leadingIcon' | 'children';
  /** Prop that reports value changes, e.g. `onValueChange`. */
  valueEvent?: string;
  /** Static props added to every render. */
  props?: Record<string, unknown>;
  /** Picks the root when it is not the first element. */
  root?: (element: HTMLElement) => HTMLElement;
}

/** Neutral props -> React idiom (props, `onClick`, `className`, attributes). */
export function reactAdapter(
  name: string,
  component: ComponentType<never>,
  options: ReactAdapterOptions = {},
): Adapter {
  const { labelAs = 'children', leadingAs = 'leadingIcon', valueEvent } = options;
  return {
    name,
    mount(neutral: NeutralProps) {
      const { label, leading, trailing, class: className, attrs, extra, ...props } = neutral;
      let clicks = 0;
      const emitted: (string | boolean)[] = [];
      const all: Record<string, unknown> = {
        ...options.props,
        ...props,
        ...extra,
        ...attrs,
        className,
        onClick: () => clicks++,
      };
      if (labelAs === 'children') all.children = label ?? '';
      else if (labelAs === 'prop' && label !== undefined) all.label = label;
      if (leading) all[leadingAs === 'children' ? 'children' : 'leadingIcon'] = leading;
      if (trailing) all.trailingIcon = trailing;
      if (valueEvent) all[valueEvent] = (value: string | boolean) => emitted.push(value);
      const result = render(
        createElement(component as unknown as ComponentType<Record<string, unknown>>, all),
      );
      const element = result.container.firstElementChild as HTMLElement;
      return {
        root: options.root ? options.root(element) : element,
        clicks: () => clicks,
        emitted: () => emitted,
        unmount: () => result.unmount(),
      };
    },
  };
}
