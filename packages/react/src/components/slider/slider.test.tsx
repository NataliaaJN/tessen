import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { sliderContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { reactAdapter } from '../../../test/adapter.tsx';
import { Slider } from './Slider.tsx';

runContract(
  sliderContract,
  reactAdapter('React (RTL)', Slider, {
    labelAs: 'none',
    valueEvent: 'onValueChange',
    props: { label: 'Volume' },
  }),
);

describe('Slider · axe', () => {
  it('has no violations enabled or disabled', async () => {
    for (const disabled of [false, true]) {
      const { unmount } = render(<Slider label="Volume" defaultValue={30} disabled={disabled} />);
      await expectNoA11yViolations(document.body);
      unmount();
    }
  });
});
