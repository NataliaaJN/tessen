import type { ButtonVariantProps } from '@tessen-ui/core/contracts/button';
import { mount } from '@vue/test-utils';
import { describe, expect, expectTypeOf, it } from 'vitest';
import TButton from './Button.vue';
import type { ButtonProps } from './button.types.ts';

describe('TButton', () => {
  it('keeps its variant props identical to the contract (type level)', () => {
    type Shared = Pick<ButtonProps, 'variant' | 'size' | 'tone' | 'block'>;
    expectTypeOf<Shared>().toExtend<ButtonVariantProps>();
    expectTypeOf<ButtonVariantProps>().toExtend<Shared>();
  });

  it('passes the click event to the listener', async () => {
    const wrapper = mount(TButton, { slots: { default: 'Save' } });
    await wrapper.trigger('click');
    const [event] = wrapper.emitted('click')![0] as [MouseEvent];
    expect(event).toBeInstanceOf(MouseEvent);
  });

  it('lets the consumer reach the DOM node through the component ref', () => {
    const wrapper = mount(TButton, { slots: { default: 'Save' } });
    expect(wrapper.element).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges style from the consumer', () => {
    const wrapper = mount(TButton, { attrs: { style: 'margin-left: 4px' } });
    expect((wrapper.element as HTMLElement).style.marginLeft).toBe('4px');
  });
});
