import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { dropdownMenuContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type DropdownMenuProps,
} from './index.ts';

/** Fixture of the contract: Trigger "Actions" + Content (Edit, Duplicate disabled, separator, Delete). */
function renderFixture(props: DropdownMenuProps, className?: string) {
  return render(
    <DropdownMenu {...props}>
      <DropdownMenuTrigger className={className}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem value="edit">Edit</DropdownMenuItem>
        <DropdownMenuItem value="duplicate" disabled>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem value="delete">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const result = renderFixture(
      { ...(neutral.extra as DropdownMenuProps), onSelect: (value) => emitted.push(value) },
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

runContract(dropdownMenuContract, reactAdapter);

describe('DropdownMenu · behaviour and axe', () => {
  it('has no violations open or closed', async () => {
    const { unmount } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem value="edit">Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-menu__trigger')!);
    await expect.poll(() => document.body.querySelector('[role="menu"]')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    unmount();
  });
});
