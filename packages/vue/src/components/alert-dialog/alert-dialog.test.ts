import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { alertDialogContract } from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import {
  TAlertDialog,
  TAlertDialogAction,
  TAlertDialogCancel,
  TAlertDialogContent,
  TAlertDialogDescription,
  TAlertDialogTitle,
  TAlertDialogTrigger,
} from './index.js';

/** Fixture of the contract: Trigger "Delete" + Content (title, description, Cancel "Keep", Action "Remove"). */
function mountFixture(
  props: Record<string, unknown>,
  emitted: (string | boolean)[] = [],
  cls?: string,
) {
  return mount(TAlertDialog, {
    props: {
      ...props,
      'onUpdate:open': (open?: boolean) => {
        if (open !== undefined) emitted.push(open);
      },
    } as never,
    slots: {
      default: () => [
        h(TAlertDialogTrigger, { class: cls }, () => 'Delete'),
        h(TAlertDialogContent, null, () => [
          h(TAlertDialogTitle, null, () => 'Delete item?'),
          h(TAlertDialogDescription, null, () => 'This cannot be undone.'),
          h(TAlertDialogCancel, null, () => 'Keep'),
          h(TAlertDialogAction, { tone: 'danger' }, () => 'Remove'),
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

runContract(alertDialogContract, vueAdapter);

describe('TAlertDialog · behaviour and axe', () => {
  it('moves focus inside and has no violations open or closed', async () => {
    const wrapper = mountFixture({});
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-dialog__trigger')!);
    await expect.poll(() => document.body.querySelector('[role="alertdialog"]')).not.toBeNull();
    const dialog = document.body.querySelector('[role="alertdialog"]')!;
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    await expect.poll(() => dialog.getAttribute('aria-labelledby')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    wrapper.unmount();
  });

  it('ignores a click outside the content', async () => {
    const wrapper = mountFixture({ defaultOpen: true });
    await expect.poll(() => document.body.querySelector('[role="alertdialog"]')).not.toBeNull();
    // jsdom cannot click "through" the inert page, so the outside pointer event is dispatched.
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.body.querySelector('[role="alertdialog"]')).not.toBeNull();
    wrapper.unmount();
  });
});
