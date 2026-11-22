import { mount } from '@vue/test-utils';
import type { NeutralProps } from '../src/core/contract.ts';
import TButton from '../src/vue/Button.vue';
import type { Adapter } from './runner.ts';

/** Neutral props -> Vue idiom: props, `@click` listener and named slots. */
export const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral: NeutralProps) {
    const { label, leading, trailing, ...props } = neutral;
    let clicks = 0;
    const slots: Record<string, string> = { default: label ?? '' };
    if (leading) slots.leading = leading;
    if (trailing) slots.trailing = trailing;
    const wrapper = mount(TButton, {
      props: { ...props, onClick: () => clicks++ } as never,
      slots,
      attachTo: document.body,
    });
    return {
      root: wrapper.element as HTMLElement,
      clicks: () => clicks,
      unmount: () => wrapper.unmount(),
    };
  },
};
