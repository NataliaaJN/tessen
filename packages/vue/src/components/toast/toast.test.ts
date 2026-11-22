import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { toastContract } from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { TToaster, createToaster, type ToastType } from './index.js';

/** Fixture of the contract: a Toaster and a "Notify" button that creates one toast. */
function mountFixture(extra: { type?: ToastType; duration?: number }, className?: string) {
  const toaster = createToaster();
  const Fixture = defineComponent({
    render: () => [
      h(
        'button',
        {
          type: 'button',
          class: className,
          onClick: () =>
            toaster.create({ title: 'Saved', description: 'Changes stored', ...extra }),
        },
        'Notify',
      ),
      h(TToaster, { toaster }),
    ],
  });
  return mount(Fixture, { attachTo: document.body });
}

const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral) {
    const wrapper = mountFixture(neutral.extra as { type?: ToastType }, neutral.class);
    return {
      root: document.body.querySelector<HTMLElement>('button')!,
      clicks: () => 0,
      emitted: () => [],
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(toastContract, vueAdapter);

describe('TToaster · behaviour and axe', () => {
  it('has no violations with a toast on screen', async () => {
    const wrapper = mountFixture({ type: 'error' });
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('button')!);
    await expect.poll(() => document.body.querySelector('.t-toast')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    wrapper.unmount();
  });
});
