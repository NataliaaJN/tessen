import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { alertDialogContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  type AlertDialogProps,
} from './index.ts';

/** Fixture of the contract: Trigger "Delete" + Content (title, description, Cancel "Keep", Action "Remove"). */
function renderFixture(props: AlertDialogProps, className?: string) {
  return render(
    <AlertDialog {...props}>
      <AlertDialogTrigger className={className}>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete item?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        <AlertDialogCancel>Keep</AlertDialogCancel>
        <AlertDialogAction tone="danger">Remove</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const result = renderFixture(
      { ...(neutral.extra as AlertDialogProps), onOpenChange: (open) => emitted.push(open) },
      neutral.class,
    );
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => result.unmount(),
    };
  },
};

runContract(alertDialogContract, reactAdapter);

describe('AlertDialog · behaviour and axe', () => {
  it('moves focus to the safe choice and has no violations open or closed', async () => {
    const { unmount } = renderFixture({});
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-dialog__trigger')!);
    await expect.poll(() => document.body.querySelector('[role="alertdialog"]')).not.toBeNull();
    const dialog = document.body.querySelector('[role="alertdialog"]')!;
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    await expect.poll(() => dialog.getAttribute('aria-labelledby')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    unmount();
  });

  it('ignores a click outside the content', async () => {
    const { unmount } = renderFixture({ defaultOpen: true });
    await expect.poll(() => document.body.querySelector('[role="alertdialog"]')).not.toBeNull();
    // jsdom cannot click "through" the inert page, so the outside pointer event is dispatched.
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.body.querySelector('[role="alertdialog"]')).not.toBeNull();
    unmount();
  });
});
