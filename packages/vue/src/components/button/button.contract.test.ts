import { buttonContract, type NeutralProps } from '@tessen-ui/core';
import { runContract, type Adapter } from '@tessen-ui/contract-runner';
import { mount } from '@vue/test-utils';
import TButton from './Button.vue';

/** Neutral props -> Vue idiom: props, `@click` listener, named slots, `class` and attributes. */
export const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral: NeutralProps) {
    const { label, leading, trailing, class: className, attrs, ...props } = neutral;
    let clicks = 0;
    const slots: Record<string, string> = { default: label ?? '' };
    if (leading) slots.leading = leading;
    if (trailing) slots.trailing = trailing;
    const wrapper = mount(TButton, {
      props: { ...props, ...attrs, class: className, onClick: () => clicks++ } as never,
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

runContract(buttonContract, vueAdapter);
