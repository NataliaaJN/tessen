import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { radioGroupContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Radio, RadioGroup } from './index.ts';

/** Fixture of the contract: RadioGroup "Plan" > Radio Free (free), Pro (pro), Team (team). */
function renderFixture(
  props: Record<string, unknown>,
  className?: string,
  onValueChange?: (value: string) => void,
) {
  return render(
    <RadioGroup aria-label="Plan" {...props} className={className} onValueChange={onValueChange}>
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
    </RadioGroup>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const result = renderFixture(neutral.extra ?? {}, neutral.class, (value) =>
      emitted.push(value),
    );
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => result.unmount(),
    };
  },
};

runContract(radioGroupContract, reactAdapter);

describe('RadioGroup · axe', () => {
  it.each([
    ['default', {}],
    ['with a selection', { defaultValue: 'pro' }],
    ['horizontal invalid', { orientation: 'horizontal', invalid: true }],
    ['disabled', { disabled: true }],
  ])('%s has no violations', async (_name, props) => {
    const { container, unmount } = renderFixture(props);
    await expectNoA11yViolations(container);
    unmount();
  });
});
