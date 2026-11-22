import type { Adapter } from '@tessen-ui/contract-runner';
import type { NeutralProps } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import type { Component } from 'vue';

export interface VueAdapterOptions {
  /** Where the neutral `label` goes: the default slot (default), the `label` prop, or nowhere. */
  labelAs?: 'slot' | 'prop' | 'none';
  /** Where the neutral `leading` goes: the `leading` slot (default) or the default slot. */
  leadingAs?: 'leading' | 'default';
  /** Prop listener that reports value changes, e.g. `onUpdate:modelValue`. */
  valueEvent?: string;
  /** Static props added to every mount. */
  props?: Record<string, unknown>;
  /** Extra slots (name -> html) added to every mount. */
  slots?: Record<string, string>;
  /** Picks the root when it is not the component's own root element. */
  root?: (element: HTMLElement) => HTMLElement;
}

/**
 * Neutral props -> Vue idiom (props, `onClick` listener, named slots, `class` and attributes).
 * One factory shared by every component's contract test.
 */
export function vueAdapter(
  name: string,
  component: Component,
  options: VueAdapterOptions = {},
): Adapter {
  const { labelAs = 'slot', leadingAs = 'leading', valueEvent } = options;
  return {
    name,
    mount(neutral: NeutralProps) {
      const { label, leading, trailing, class: className, attrs, extra, ...props } = neutral;
      let clicks = 0;
      const emitted: (string | boolean)[] = [];
      const slots: Record<string, string> = { ...options.slots };
      const own: Record<string, unknown> = { ...options.props };
      if (labelAs === 'slot') slots.default = label ?? '';
      else if (labelAs === 'prop' && label !== undefined) own.label = label;
      if (leading) slots[leadingAs === 'default' ? 'default' : 'leading'] = leading;
      if (trailing) slots.trailing = trailing;
      if (valueEvent) own[valueEvent] = (value: string | boolean) => emitted.push(value);
      const wrapper = mount(component, {
        props: { ...own, ...props, ...extra, ...attrs, class: className, onClick: () => clicks++ },
        slots,
        attachTo: document.body,
      } as never);
      const element = wrapper.element as HTMLElement;
      return {
        root: options.root ? options.root(element) : element,
        clicks: () => clicks,
        emitted: () => emitted,
        unmount: () => wrapper.unmount(),
      };
    },
  };
}
