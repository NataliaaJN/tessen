import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { popoverContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  type PopoverProps,
} from './index.ts';

/** Fixture of the contract: Popover > Trigger "Details" + Content (title, description, "Inside", Close). */
function renderFixture(props: PopoverProps, className?: string) {
  return render(
    <Popover {...props}>
      <PopoverTrigger className={className}>Details</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Shipping</PopoverTitle>
        <PopoverDescription>Arrives in two days.</PopoverDescription>
        <button type="button">Inside</button>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const result = renderFixture(
      { ...(neutral.extra as PopoverProps), onOpenChange: (open) => emitted.push(open) },
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

runContract(popoverContract, reactAdapter);

describe('Popover · behaviour and axe', () => {
  it('leaves the rest of the page reachable and has no violations open or closed', async () => {
    const { unmount } = render(
      <>
        <button type="button">Elsewhere</button>
        <Popover>
          <PopoverTrigger>Details</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Shipping</PopoverTitle>
            <PopoverClose>Close</PopoverClose>
          </PopoverContent>
        </Popover>
      </>,
    );
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-popover__trigger')!);
    await expect.poll(() => document.body.querySelector('[role="dialog"]')).not.toBeNull();
    const dialog = document.body.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBeNull();
    await expect.poll(() => dialog.getAttribute('aria-labelledby')).not.toBeNull();
    expect(document.body.querySelector('button')?.closest('[aria-hidden="true"]')).toBeNull();
    await expectNoA11yViolations(document.body);
    unmount();
  });
});
