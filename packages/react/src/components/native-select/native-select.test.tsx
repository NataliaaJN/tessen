import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { nativeSelectContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { NativeSelect, type NativeSelectProps } from './NativeSelect.tsx';

/** Fixture of the contract: NativeSelect "Country" with Spain (es), France (fr), Italy (it). */
function renderFixture(props: NativeSelectProps) {
  return render(
    <NativeSelect aria-label="Country" {...props}>
      <option value="es">Spain</option>
      <option value="fr">France</option>
      <option value="it">Italy</option>
    </NativeSelect>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const result = renderFixture({
      ...(neutral.extra as NativeSelectProps),
      size: neutral.size as NativeSelectProps['size'],
      className: neutral.class,
      onValueChange: (value) => emitted.push(value),
    });
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => result.unmount(),
    };
  },
};

runContract(nativeSelectContract, reactAdapter);

describe('NativeSelect · axe', () => {
  it.each([
    ['default', {}],
    ['invalid', { invalid: true }],
    ['disabled', { disabled: true }],
  ])('%s has no violations', async (_name, props) => {
    const { container, unmount } = renderFixture(props);
    await expectNoA11yViolations(container);
    unmount();
  });
});
