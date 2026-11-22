import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { tooltipContract } from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip, TooltipContent, TooltipTrigger, type TooltipProps } from './index.ts';

/** Fixture of the contract: Tooltip > TooltipTrigger "Save" + TooltipContent "Save the file". */
function renderFixture(props: TooltipProps, className?: string) {
  return render(
    <Tooltip {...props}>
      <TooltipTrigger className={className}>Save</TooltipTrigger>
      <TooltipContent>Save the file</TooltipContent>
    </Tooltip>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const result = renderFixture({ ...(neutral.extra as TooltipProps) }, neutral.class);
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => 0,
      unmount: () => result.unmount(),
    };
  },
};

runContract(tooltipContract, reactAdapter);

describe('Tooltip · behaviour and axe', () => {
  it('opens on keyboard Tab with no delay and has no axe violations', async () => {
    const { unmount } = renderFixture({ openDelay: 0 });
    await userEvent.setup().tab();
    await expect.poll(() => document.body.querySelector('[role="tooltip"]')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    unmount();
  });
});
