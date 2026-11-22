import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { popoverContract } from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import {
  TPopover,
  TPopoverClose,
  TPopoverContent,
  TPopoverDescription,
  TPopoverTitle,
  TPopoverTrigger,
} from './index.js';

/** Fixture of the contract: Popover > Trigger "Details" + Content (title, description, "Inside", Close). */
function mountFixture(
  props: Record<string, unknown>,
  emitted: (string | boolean)[] = [],
  cls?: string,
) {
  return mount(TPopover, {
    props: {
      ...props,
      'onUpdate:open': (open?: boolean) => {
        if (open !== undefined) emitted.push(open);
      },
    } as never,
    slots: {
      default: () => [
        h(TPopoverTrigger, { class: cls }, () => 'Details'),
        h(TPopoverContent, null, () => [
          h(TPopoverTitle, null, () => 'Shipping'),
          h(TPopoverDescription, null, () => 'Arrives in two days.'),
          h('button', { type: 'button' }, 'Inside'),
          h(TPopoverClose, null, () => 'Close'),
        ]),
      ],
    },
    attachTo: document.body,
  });
}

const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const wrapper = mountFixture({ ...neutral.extra }, emitted, neutral.class);
    return {
      root: document.body.querySelector<HTMLElement>('.t-popover__trigger')!,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(popoverContract, vueAdapter);

describe('TPopover · behaviour and axe', () => {
  it('leaves the page reachable and has no violations open or closed', async () => {
    const wrapper = mountFixture({});
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-popover__trigger')!);
    await expect.poll(() => document.body.querySelector('[role="dialog"]')).not.toBeNull();
    const dialog = document.body.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBeNull();
    await expect.poll(() => dialog.getAttribute('aria-labelledby')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    wrapper.unmount();
  });
});
