import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { dialogContract } from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import {
  TDialog,
  TDialogClose,
  TDialogContent,
  TDialogDescription,
  TDialogTitle,
  TDialogTrigger,
} from './index.js';

/** Fixture of the contract: Dialog > Trigger "Open" + Content (title, description, "Inside", Close). */
function mountFixture(
  props: Record<string, unknown>,
  emitted: (string | boolean)[] = [],
  cls?: string,
) {
  return mount(TDialog, {
    props: {
      ...props,
      'onUpdate:open': (open?: boolean) => {
        if (open !== undefined) emitted.push(open);
      },
    } as never,
    slots: {
      default: () => [
        h(TDialogTrigger, { class: cls }, () => 'Open'),
        h(TDialogContent, null, () => [
          h(TDialogTitle, null, () => 'Delete item'),
          h(TDialogDescription, null, () => 'This cannot be undone.'),
          h('button', { type: 'button' }, 'Inside'),
          h(TDialogClose, null, () => 'Close'),
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
      root: document.body.querySelector<HTMLElement>('.t-dialog__trigger')!,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(dialogContract, vueAdapter);

describe('TDialog · behaviour and axe', () => {
  it('moves focus inside when it opens and has no axe violations open or closed', async () => {
    const wrapper = mountFixture({});
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-dialog__trigger')!);
    await expect.poll(() => document.body.querySelector('[role="dialog"]')).not.toBeNull();
    const dialog = document.body.querySelector('[role="dialog"]')!;
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    await expectNoA11yViolations(document.body);
    wrapper.unmount();
  });
});
