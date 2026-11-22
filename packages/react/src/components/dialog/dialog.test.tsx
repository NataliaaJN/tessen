import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { dialogContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  type DialogProps,
} from './index.ts';

/** Fixture of the contract: Dialog > Trigger "Open" + Content (title, description, "Inside", Close). */
function renderFixture(props: DialogProps, className?: string) {
  return render(
    <Dialog {...props}>
      <DialogTrigger className={className}>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete item</DialogTitle>
        <DialogDescription>This cannot be undone.</DialogDescription>
        <button type="button">Inside</button>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const result = renderFixture(
      { ...(neutral.extra as DialogProps), onOpenChange: (open) => emitted.push(open) },
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

runContract(dialogContract, reactAdapter);

describe('Dialog · behaviour and axe', () => {
  it('moves focus inside when it opens and has no axe violations open or closed', async () => {
    const { unmount } = renderFixture({});
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-dialog__trigger')!);
    await expect.poll(() => document.body.querySelector('[role="dialog"]')).not.toBeNull();
    const dialog = document.body.querySelector('[role="dialog"]')!;
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    await expectNoA11yViolations(document.body);
    unmount();
  });
});
