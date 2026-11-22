import { expectNoA11yViolations } from '@tessen-ui/contract-runner';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import TButton from './Button.vue';
import type { ButtonProps } from './button.types.ts';

const states: [string, ButtonProps][] = [
  ['default', {}],
  ['secondary danger', { variant: 'secondary', tone: 'danger' }],
  ['link', { variant: 'link' }],
  ['disabled', { disabled: true }],
  ['loading', { loading: true }],
];

describe('TButton · axe', () => {
  it.each(states)('%s has no violations', async (_name, props) => {
    const wrapper = mount(TButton, { props, slots: { default: 'Save' }, attachTo: document.body });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });

  it('with only an icon it needs an accessible name (aria-label)', async () => {
    const wrapper = mount(TButton, {
      attrs: { 'aria-label': 'Close' },
      slots: { leading: '<svg aria-hidden="true" width="16" height="16"></svg>' },
      attachTo: document.body,
    });
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
